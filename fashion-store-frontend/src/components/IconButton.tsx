// components/IconButton.tsx
import {Link} from "react-router-dom";

interface IconButtonProps {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    onClick?: () => void;
    size?: number;
    className?: string;
    badge?: number;
    href?: string;
}

const IconButton = ({
                        icon: Icon,
                        onClick,
                        size = 20,
                        className = '',
                        badge,
                        href
                    }: IconButtonProps) => {
    const buttonContent = (
        <>
            <Icon size={size} className={className} />
            {badge && badge > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                      style={{
                          fontSize: '0.6rem',
                          padding: '2px 5px',
                          backgroundColor: '#fe722c', // ОРАНЖЕВЫЙ ЦВЕТ
                          color: 'white',
                          border: '2px solid var(--cream-bg)',
                          animation: badge > 0 ? 'pulse 1.5s infinite' : 'none'
                      }}>
                    {badge}
                </span>
            )}
        </>
    );

    if (href) {
        return (
            <Link to={href} className="btn btn-link text-white p-2 position-relative"
                  style={{ textDecoration: 'none', border: 'none', background: 'none' }}>
                {buttonContent}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className="btn btn-link text-white p-2 position-relative"
                style={{ textDecoration: 'none', border: 'none', background: 'none' }}>
            {buttonContent}
        </button>
    );
};

export default IconButton;