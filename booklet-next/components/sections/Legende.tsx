import legendeData from '@/lib/data/legende.generated.json';

export default function Legende() {
  return (
    <div>
      <h2 className="mb-4 text-[30px] font-extrabold tracking-tight">Legende &amp; System</h2>
      <div dangerouslySetInnerHTML={{ __html: legendeData.inner_html }} />
    </div>
  );
}
