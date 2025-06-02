interface MyProps {
  text: string;
}

const ArchTitle = ({ text }: MyProps) => {
  return (
    <svg
      width="100%"
      height="120"
      viewBox="0 0 600 120"
      style={{ display: "block", margin: "0 auto" }}
      aria-label={text}
      role="img"
    >
      <defs>
        <path
          id="gentleArcPath"
          d="M 50 100 Q 300 20 550 100"
          fill="transparent"
        />
      </defs>

      <text
        fontSize="36"
        fontWeight="bold"
        fontFamily="'Georgia', serif"
        fill="url(#sageGradient)"
      >
        <textPath href="#gentleArcPath" startOffset="50%" textAnchor="middle">
          {text}
        </textPath>
      </text>

      <defs>
        <linearGradient id="sageGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#9caf88" />
          <stop offset="100%" stopColor="#7a8a67" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default ArchTitle;
