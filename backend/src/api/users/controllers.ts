import { Request, Response } from "express";
import { PrismaClient, User } from "@prisma/client";
import { isNumeric } from "@utils";
const prisma = new PrismaClient();

export async function getCurrentUserInfo(req: Request, res: Response) {
  if (!req.user) return res.status(401).send();
  return res.status(200).json({ ...req.user });
}

export async function updateUser(req: Request, res: Response) {
  if (!isNumeric(req.params.id)) return res.sendStatus(400);

  const id = Number(req.params.id);

  if (req.user?.id != id) return res.sendStatus(401);

  const { email, image } = req.body;

  try {
    const user = (await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        email,
        image,
      },
    })) as User;
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
}
