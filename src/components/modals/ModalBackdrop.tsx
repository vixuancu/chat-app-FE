interface ModalBackdropProps {
    children: React.ReactNode;
    onClose: () => void;
    zIndex?: number;
}

export const ModalBackdrop: React.FC<ModalBackdropProps> = ({ children, onClose, zIndex = 40 }) => {
    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
            style={{ zIndex }}
        >
            <div
                className="fixed inset-0"
                onClick={onClose}
            />
            <div className="relative" style={{ zIndex: zIndex + 10 }}>
                {children}
            </div>
        </div>
    );
};
