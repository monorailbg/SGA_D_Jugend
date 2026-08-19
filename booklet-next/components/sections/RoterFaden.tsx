import { faden } from '@/lib/data/faden';

export default function RoterFaden() {
  return (
    <div>
      <h2 className="mb-1 text-[30px] font-extrabold tracking-tight">Roter Faden</h2>
      <p className="lead mb-4">Die Entwicklungslogik über die fünf Saisonphasen hinweg.</p>
      <div>
        {faden.map((f, i) => (
          <div key={f.num} className={`flex gap-4 py-3.5 ${i > 0 ? 'border-t border-dashed border-line' : ''}`}>
            <div className="min-w-[34px] font-ui text-[30px] font-extrabold leading-none text-green">{f.num}</div>
            <div>
              <b className="mb-1 block text-base">{f.title}</b>
              <p className="m-0">{f.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
