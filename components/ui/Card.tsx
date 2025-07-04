import { ReactNode } from 'react';

interface CardProps {
	children: ReactNode;
	className?: string;
	hover?: boolean;
}

const Card = ({ children, className = '', hover = false }: CardProps) => {
	return (
		<div className={`
      bg-background 
      border border-border 
      rounded-xl 
      p-6 
      shadow-sm
      ${hover ? 'hover:shadow-md hover:border-primary transition-all duration-200 cursor-pointer' : ''}
      ${className}
    `}>
			{children}
		</div>
	);
};

export default Card;
