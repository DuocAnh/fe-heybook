import { useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { io } from 'socket.io-client'
import { selectCurrentUser } from '@/redux/userSlice'

const socket = io('http://localhost:3000')

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [formData, setFormData] = useState({ service: '', message: '' })
    const [chatStarted, setChatStarted] = useState(false)
    const [messages, setMessages] = useState([])
    const messageEndRef = useRef(null)
    const userIdRef = useRef('')

    const currentUser = useSelector(selectCurrentUser)
    console.log(userIdRef.current, 'ducanh');


    useEffect(() => {
        if (currentUser?.userName) {
            userIdRef.current = currentUser.userName
        }
    }, [currentUser])

    useEffect(() => {
        socket.on('newMessage', (msg) => {
            if (msg.from === 'admin' && msg.to === userIdRef.current) {
                setMessages((prev) => [...prev, { sender: 'admin', content: msg.content }])
            }
        })

        return () => {
            socket.off('newMessage')
        }
    }, [])

    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages])

    const handleStartChat = (e) => {
        e.preventDefault()
        const { service, message } = formData
        const name = currentUser?.userName
        console.log(userIdRef.current, service, message, 'anhh');


        if (!name || !service || !message) {

            alert('Vui lòng nhập đầy đủ thông tin')
            return
        }

        userIdRef.current = name

        socket.emit('register', {
            name,
            service,
            message
        })

        socket.emit('sendMessage', {
            from: name,
            to: 'admin',
            content: message,
            timestamp: new Date().toISOString()
        })

        setMessages([
            {
                sender: 'user',
                content: message,
                timestamp: new Date().toISOString()
            }
        ])

        setChatStarted(true)
        setFormData({ ...formData, message: '' })
    }

    const handleSend = (e) => {
        e.preventDefault()
        if (!formData.message.trim()) return

        const msg = {
            from: userIdRef.current,
            to: 'admin',
            content: formData.message,
            timestamp: new Date().toISOString()
        }

        socket.emit('sendMessage', msg)

        setMessages((prev) => [...prev, { sender: 'user', content: formData.message }])
        setFormData((prev) => ({ ...prev, message: '' }))
    }

    const handleCloseChat = () => {
        setIsOpen(false)
        setChatStarted(false)
        setMessages([])
        socket.disconnect()
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen ? (
                <div className="w-80 bg-white rounded shadow-lg p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="font-bold text-lg">Hỗ trợ trực tuyến</h2>
                        <button onClick={handleCloseChat} className="text-red-500 font-bold text-xl">×</button>
                    </div>

                    {!chatStarted ? (
                        <form onSubmit={handleStartChat} className="flex flex-col gap-2">
                            <input
                                type="text"
                                placeholder="Dịch vụ quan tâm"
                                className="border px-2 py-1 rounded"
                                value={formData.service}
                                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                            />
                            <textarea
                                placeholder="Lời nhắn..."
                                className="border px-2 py-1 rounded"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            />
                            <button type="submit" className="bg-red-500 text-white px-3 py-1 rounded">
                                Bắt đầu trò chuyện
                            </button>
                        </form>
                    ) : (
                        <>
                            <div className="h-60 overflow-y-auto bg-gray-100 p-2 rounded">
                                {messages.map((m, idx) => (
                                    <div key={idx} className={`mb-2 ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                        <div className={`inline-block px-3 py-2 rounded ${m.sender === 'user' ? 'bg-blue-100' : 'bg-white'}`}>
                                            {m.content}
                                        </div>
                                    </div>
                                ))}
                                <div ref={messageEndRef}></div>
                            </div>

                            <form onSubmit={handleSend} className="flex mt-2">
                                <input
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Nhập tin nhắn..."
                                    className="flex-1 border px-2 py-1 rounded"
                                />
                                <button type="submit" className="ml-2 bg-red-500 text-white px-3 rounded">
                                    Gửi
                                </button>
                            </form>
                        </>
                    )}
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-red-500 text-white p-3 rounded-full shadow-md"
                >
                    💬
                </button>
            )}
        </div>
    )
}

export default ChatWidget
