import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;
const publicUrlBase = process.env.R2_PUBLIC_URL;

const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;

const S3 = new S3Client({
  region: "auto",
  endpoint: endpoint,
  credentials: {
    accessKeyId: accessKeyId!,
    secretAccessKey: secretAccessKey!,
  },
});

export async function uploadFileToR2(
  fileName: string,
  body: Buffer,
  contentType: string
) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: body,
    ContentType: contentType,
  });

  try {
    console.log(
      `[UPLOAD SERVIÇO] - Enviando comando para o S3/R2. Bucket: ${bucketName}, Key: ${fileName}`
    );
    await S3.send(command);
    console.log("[UPLOAD SERVIÇO] - Comando S3 executado com sucesso.");

    if (!publicUrlBase) {
      throw new Error("A URL pública do R2 não está configurada no .env");
    }

    const publicUrl = `${publicUrlBase}/${fileName}`;

    return publicUrl;
  } catch (error) {
    console.error(
      "[UPLOAD SERVIÇO] - Erro ao enviar o arquivo para o R2:",
      error
    );
    throw error;
  }
}
