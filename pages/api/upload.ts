import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import formidable from 'formidable';
import { promises as fs } from 'fs';
import { IncomingForm } from 'formidable';
import { v2 as cloudinary } from 'cloudinary';


export interface NextApiRequestWithFormidable extends NextApiRequest {
  files?: {
    file?: formidable.File[];
  };
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequestWithFormidable,
  res: NextApiResponse
) {
  const form = new IncomingForm();

  form.parse(req, async (err: any, fields: any, files: any) => {
    if (err) {
      return res.status(500).json({ error: 'Error parsing the form data.' });
    }

    const file = files.file?.[0];
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    try {
      const fileContent = await fs.readFile(file.filepath);

      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      const uploadResponse = await cloudinary.uploader.upload(`data:${file.mimetype};base64,${fileContent.toString('base64')}`);
      res.status(200).json({ url: uploadResponse.url });
    } catch (error) {
      res.status(500).json({ error: 'Error uploading the file.' });
    }
  });
}
