import type { DocumentExtractionBody } from "@/lib/clinical/documents.types";

/**
 * Shows what was organised out of a document's text. Every item is shown with
 * the exact words it came from, and nothing here is treated as confirmed.
 */

function Group({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; detail?: string | null; evidence?: string | null }>;
}) {
  if (items.length === 0) return null;
  return (
    <section className="rounded-2xl border border-border bg-background p-4">
      <h4 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
        {title}
      </h4>
      <ul className="mt-3 space-y-3">
        {items.map((item, index) => (
          <li
            key={`${item.label}-${index}`}
            className="border-t border-border pt-3 first:border-t-0 first:pt-0"
          >
            <p className="text-[15px] font-semibold">{item.label}</p>
            {item.detail ? (
              <p className="mt-0.5 text-sm text-muted-foreground">{item.detail}</p>
            ) : null}
            {item.evidence ? (
              <p className="mt-1 text-xs text-muted-foreground">Read from: “{item.evidence}”</p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function StructuredDocumentView({ body }: { body: DocumentExtractionBody }) {
  const header: Array<[string, string | null]> = [
    ["Document type", body.documentType],
    ["Date on the document", body.documentDate],
    ["Clinic or hospital", body.hospitalOrClinic],
    ["Doctor", body.doctorName],
    ["Name on the document", body.patientName],
    ["Follow-up", body.followUpInformation],
  ];
  const shownHeader = header.filter(([, value]) => Boolean(value));

  return (
    <div className="space-y-4">
      {shownHeader.length > 0 ? (
        <section className="rounded-2xl border border-border bg-background p-4">
          <h4 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
            Document details
          </h4>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            {shownHeader.map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="text-[15px] font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <Group
        title="Medicines"
        items={body.medications.map((item) => ({
          label: item.medication,
          detail: [item.dose, item.frequency, item.duration].filter(Boolean).join(" · ") || null,
          evidence: item.evidence,
        }))}
      />
      <Group
        title="Test results"
        items={body.labResults.map((item) => ({
          label: item.test,
          detail:
            [item.value, item.unit].filter(Boolean).join(" ") +
              (item.referenceRange ? ` (normal: ${item.referenceRange})` : "") || null,
          evidence: item.evidence,
        }))}
      />
      <Group
        title="Allergies"
        items={body.allergiesMentioned.map((item) => ({
          label: item.value,
          evidence: item.evidence,
        }))}
      />
      <Group
        title="Recorded in the document"
        items={body.diagnosesMentioned.map((item) => ({
          label: item.value,
          evidence: item.evidence,
        }))}
      />
      <Group
        title="Symptoms written down"
        items={body.symptomsMentioned.map((item) => ({
          label: item.value,
          evidence: item.evidence,
        }))}
      />
      <Group
        title="Measurements"
        items={body.vitalValues.map((item) => ({ label: item.value, evidence: item.evidence }))}
      />
      <Group
        title="Tests advised"
        items={body.investigations.map((item) => ({ label: item.value, evidence: item.evidence }))}
      />
      <Group
        title="Procedures"
        items={body.procedures.map((item) => ({ label: item.value, evidence: item.evidence }))}
      />
      <Group
        title="Advice in the document"
        items={body.recommendationsMentioned.map((item) => ({
          label: item.value,
          evidence: item.evidence,
        }))}
      />
      <Group
        title="Other noted points"
        items={body.importantFindings.map((item) => ({
          label: item.value,
          evidence: item.evidence,
        }))}
      />

      {body.uncertainItems.length > 0 ? (
        <section className="rounded-2xl border border-border bg-surface p-4">
          <h4 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
            Unclear in the text — a person should check these
          </h4>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
            {body.uncertainItems.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
