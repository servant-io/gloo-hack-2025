import AnimatedCounter from '../AnimatedCounter';

export default function AnimatedCounterExample() {
  return (
    <div className="p-8 bg-background">
      <AnimatedCounter
        start={247893}
        end={248156}
        prefix="$"
        className="text-4xl font-heading font-bold text-primary"
      />
    </div>
  );
}
