interface AvatarProps {
    name: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 'md', className = '' }) => {
    // Tạo màu avatar dựa trên tên
    const getAvatarColor = (name: string) => {
        const colors = [
            'bg-indigo-500',
            'bg-purple-500', 
            'bg-pink-500',
            'bg-red-500',
            'bg-orange-500',
            'bg-yellow-500',
            'bg-green-500',
            'bg-blue-500',
            'bg-cyan-500',
            'bg-teal-500'
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    // Lấy chữ cái đầu (có thể là 2 chữ cái nếu có họ và tên)
    const getInitials = (name: string) => {
        const words = name.trim().split(' ');
        if (words.length >= 2) {
            return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
        }
        return name.charAt(0).toUpperCase();
    };

    // Size classes
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm', 
        lg: 'w-12 h-12 text-base'
    };

    return (
        <div className={`
            ${sizeClasses[size]} 
            ${getAvatarColor(name)} 
            rounded-full flex items-center justify-center text-white font-semibold
            ${className}
        `}>
            {getInitials(name)}
        </div>
    );
};
