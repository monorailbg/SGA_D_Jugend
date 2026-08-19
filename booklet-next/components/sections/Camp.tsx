import campData from '@/lib/data/camp.generated.json';

export default function Camp() {
  return (
    <div>
      <h2 className="mb-1 text-[30px] font-extrabold tracking-tight">
        Trainingslager (Sa. 22. Aug.) + Pokalspiel (So. 23. Aug.)
      </h2>
      <div dangerouslySetInnerHTML={{ __html: campData.inner_html }} />
    </div>
  );
}
