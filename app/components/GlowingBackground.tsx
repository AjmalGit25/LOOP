import "../globals.css";

export default function GlowingBackground() {
  return (
    <div aria-hidden='true' className='pointer-events-none absolute inset-0 overflow-hidden'>
      <div className='gold-ambient one' />
      <div className='gold-ambient two' />
      <div className='gold-ambient three' />
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,197,62,0.12),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(212,175,55,0.14),_transparent_34%)]' />
    </div>
  );
}
