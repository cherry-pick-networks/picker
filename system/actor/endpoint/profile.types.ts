import {
  ProfilePatchSchema,
  ProgressPatchSchema,
} from "../service/profile.ts";

export type PatchProfileInput = {
  id: string;
  parsed: ReturnType<typeof ProfilePatchSchema.safeParse>;
};

export type PatchProgressInput = {
  id: string;
  parsed: ReturnType<typeof ProgressPatchSchema.safeParse>;
};
