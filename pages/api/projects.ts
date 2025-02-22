import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  switch (req.method) {
    case "GET":
      try {
        const projects = await prisma.project.findMany({
          orderBy: { createdAt: "desc" },
        });
        res.status(200).json(projects);
      } catch (error) {
        res.status(500).json({ message: "Error fetching projects" });
      }
      break;

    case "POST":
      try {
        const { name, description, tags } = req.body;
        const project = await prisma.project.create({
          data: {
            name,
            description,
            tags,
          },
        });
        res.status(201).json(project);
      } catch (error) {
        res.status(500).json({ message: "Error creating project" });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 