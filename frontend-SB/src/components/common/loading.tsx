interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = { sm: "w-4 h-4 border-[1.5px]", md: "w-6 h-6 border-2", lg: "w-8 h-8 border-2" };

export default function Loading({ size = "md", className = "" }: LoadingProps) {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className={`${sizes[size]} border-primary-500 border-t-transparent rounded-full animate-spin`} />
    </div>
  );
}
