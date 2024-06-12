import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { Order } from "../types";
import { getUserIdFromToken } from "../utils";

const createOrder = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = getUserIdFromToken(authHeader);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
    }

    const {
      pickupname,
      pickupaddress,
      pickupitem,
      pickupphone,
      deliverymode,
      dropoffname,
      dropoffaddress,
      dropoffphone,
      deliverytype,
      note,
      weight,
      insurance,
    }: Order = req.body;

    const newOrder = await prisma.order.create({
      data: {
        pickupname,
        pickupaddress,
        pickupitem: Array.isArray(pickupitem) ? pickupitem : [pickupitem],
        pickupphone,
        deliverymode,
        dropoffname,
        dropoffaddress,
        dropoffphone,
        deliverytype,
        note: note ? note : "",
        weight: weight ? weight : "",
        insurance: insurance ? insurance : false,
        userId,
      },
    });

    return res.status(201).json({
      message: "Order has been created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export { createOrder };
