interface ModalBackdropProps {
    children: React.ReactNode;
    onClose: () => void;
}

export const ModalBackdrop: React.FC<ModalBackdropProps> = ({ children, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
            <div
                className="fixed inset-0"
                onClick={onClose}
            />
            <div className="relative z-50">
                {children}
            </div>
        </div>
    );
};
