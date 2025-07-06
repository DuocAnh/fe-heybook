import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import io from 'socket.io-client';

const socket = io('http://localhost:3000'); // ⚠️ Đổi khi deploy

const LiveChat = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [reply, setReply] = useState('');
    const selectedUserRef = useRef(null);

    // 🧠 Khi admin kết nối
    useEffect(() => {
        socket.emit('adminConnect');

        socket.on('userList', (userList) => {
            setUsers(userList);
        });

        return () => {
            socket.off('userList');
        };
    }, []);

    useEffect(() => {
        selectedUserRef.current = selectedUser;
    }, [selectedUser]);

    // 📩 Nhận tin nhắn mới
    useEffect(() => {
        const handleNewMessage = (msg) => {
            const selected = selectedUserRef.current;
            if (msg?.from === selected?.name || msg?.to === selected?.name) {

                setMessages((prev) => [...prev, msg]);
            }
        };

        socket.on('newMessage', handleNewMessage);

        return () => {
            socket.off('newMessage', handleNewMessage);
        };
    }, []);

    // 🔄 Khi chọn user, lấy lịch sử
    useEffect(() => {
        if (selectedUser?.name) {
            socket.emit('joinConversation', selectedUser.name);
            socket.emit('getMessages', selectedUser.name);

            socket.once('messageHistory', (msgs) => {
                console.log('🗂 Lịch sử tin nhắn:', msgs);
                setMessages(msgs || []);
            });
        }
    }, [selectedUser]);

    // 📤 Gửi tin nhắn admin
    const sendReply = () => {
        if (!reply.trim() || !selectedUser?.name) return;

        const message = {
            from: 'admin',
            to: selectedUser.name,
            content: reply.trim(),
            timestamp: new Date().toISOString()
        };

        socket.emit('sendMessage', message);
        setMessages((prev) => [...prev, message]);
        setReply('');
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
            {/* Danh sách user */}
            <div className="col-span-1">
                <Card>
                    <CardHeader className="font-bold text-lg">Khách hàng nhắn đến</CardHeader>
                    <CardContent className="space-y-2 max-h-[75vh] overflow-auto">
                        {users.map((u) => (
                            <div
                                key={u.id}
                                className={`p-3 border rounded cursor-pointer ${selectedUser?.id === u.id ? 'bg-gray-100' : ''}`}
                                onClick={() => setSelectedUser(u)}
                            >
                                <div className="font-medium">{u.name || 'Ẩn danh'}</div>
                                <div className="text-sm mt-1 line-clamp-2">{u.message || '...'}</div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Khung chat */}
            <div className="col-span-2">
                {selectedUser ? (
                    <Card className="h-full flex flex-col">
                        <CardHeader className="font-semibold">
                            Chat với: {selectedUser.name}
                        </CardHeader>

                        <CardContent className="flex-1 overflow-auto space-y-2">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`p-2 rounded w-fit max-w-[70%] ${msg.sender === 'admin' ? 'ml-auto bg-blue-100 text-right' : 'mr-auto bg-gray-100'}`}
                                >
                                    <p className="text-sm">{msg.content}</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(msg.timestamp).toLocaleTimeString()}
                                    </p>
                                </div>
                            ))}
                        </CardContent>

                        <div className="flex items-center gap-2 border-t p-4">
                            <Input
                                placeholder="Nhập phản hồi..."
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                            />
                            <Button onClick={sendReply}>Gửi</Button>
                        </div>
                    </Card>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 italic">
                        Chọn 1 khách hàng để bắt đầu trò chuyện
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveChat;