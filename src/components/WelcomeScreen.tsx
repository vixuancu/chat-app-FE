export const WelcomeScreen: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-50">
            <svg
                className="w-32 h-32 text-indigo-200"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.76 9.76 0 0 1-2.53-0.471L4.5 21l.23-2.529a8.88 8.88 0 0 1-1.635-4.471C2.25 12.56 3.75 9.75 6 8.25m9-3.75a8.25 8.25 0 0 0-18 0c0 1.29.313 2.521.874 3.625M12 4.5c2.43 0 4.63.813 6.375 2.125"
                />
            </svg>
            <h2 className="mt-6 text-2xl font-semibold text-gray-700">
                Chào mừng đến với Chat App
            </h2>
            <p className="mt-2 text-gray-500">
                Chọn một phòng để bắt đầu trò chuyện.
            </p>
        </div>
    );
};
