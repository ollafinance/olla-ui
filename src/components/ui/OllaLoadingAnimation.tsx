import { Player } from "@lottiefiles/react-lottie-player";
import ollaStakingAnimation from "@/assets/animations/olla-staking-animation.json";

interface OllaLoadingAnimationProps {
  className?: string;
  loop?: boolean;
}

export function OllaLoadingAnimation({ className, loop = true }: OllaLoadingAnimationProps) {
  return (
    <Player
      autoplay={true}
      loop={loop}
      src={ollaStakingAnimation}
      renderer="canvas"
      style={{ width: 160, height: 72 }}
      className={className}
      rendererSettings={{
        preserveAspectRatio: "xMidYMid slice",
        clearCanvas: true,
      }}
    />
  );
}
