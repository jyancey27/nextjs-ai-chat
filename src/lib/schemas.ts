import { z } from "zod";

const personSchema = z
  .object({
    name: z.optional(z.string()).describe("The name of the person"),
    address: z
      .optional(z.string())
      .describe("The address of the person, if present"),
    phoneNumber: z
      .optional(z.string())
      .describe("The phone number of the person, if present"),
    email: z
      .optional(z.string())
      .describe("The email of the person, if present"),
  })
  .describe("Information about a person.");

export const candidatesSchema = z.object({
  candidates: z.array(personSchema),
});
