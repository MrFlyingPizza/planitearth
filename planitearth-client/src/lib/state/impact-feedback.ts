export const impactImages = ["fallen", "sick", "usual", "healing"] as const;
const impactImageSet: ReadonlySet<string> = new Set(impactImages);

export type ImpactImage = (typeof impactImages)[number];

export type ImpactFeedback = {
  image: ImpactImage;
  feedback: string;
  title: string;
};

function isImpactImage(value: unknown): value is ImpactImage {
  return typeof value === "string" && impactImageSet.has(value);
}

export function parseImpactFeedback(value: unknown): ImpactFeedback {
  if (
    typeof value !== "object" ||
    value === null ||
    !("image" in value) ||
    !("feedback" in value) ||
    !("title" in value) ||
    !isImpactImage(value.image) ||
    typeof value.feedback !== "string" ||
    typeof value.title !== "string"
  ) {
    throw new Error("Feedback API returned an invalid response.");
  }

  return {
    image: value.image,
    feedback: value.feedback,
    title: value.title,
  };
}
