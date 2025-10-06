import FloatingDemoButton from '../FloatingDemoButton';

export default function FloatingDemoButtonExample() {
  return (
    <div className="h-[200vh] bg-background p-8">
      <div className="text-center text-muted-foreground">
        Scroll down to see the floating button appear
      </div>
      <FloatingDemoButton />
    </div>
  );
}
