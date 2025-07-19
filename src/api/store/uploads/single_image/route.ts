import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows";
import { MedusaError } from "@medusajs/framework/utils";
import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";

// /store/uploads/single_image/ - upload single image
export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const file = req.file;
  if (!file) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "No file uploaded");
  }

  const { result } = await uploadFilesWorkflow(req.scope).run({
    input: {
      files: [
        {
          filename: file.originalname,
          mimeType: file.mimetype,
          content: file.buffer.toString("binary"),
          access: "public",
        },
      ],
    },
  });

  // result is an array of uploaded file info
  res.status(200).json({ url: result[0].url });
}
