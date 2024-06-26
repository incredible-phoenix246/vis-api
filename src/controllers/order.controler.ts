import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { Order, Bid } from "../types";
import { getUserIdFromToken } from "../utils";
import { compilerOrder } from "../complier";
import { Sendmail } from "../utils/mailer";
import { CreateNotification } from "../utils/notification";

const createOrder = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    console.log("pass 1");

    const userId = getUserIdFromToken(authHeader);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
    }

    console.log("pass 2");

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
      itemvalue,
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
        itemvalue: itemvalue ? itemvalue : "",
      },
    });

    console.log("pass 3");

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    console.log("pass 4");

    try {
      await Sendmail({
        from: `VISCIO <support@viscio.com>`,
        to: user.email,
        subject: "Order Created Successfully",
        html: compilerOrder(newOrder.id),
      });
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
    }

    console.log("pass 5");

    await CreateNotification({
      from: "VISCIO System",
      avatar: "/main.png",
      type: "order",
      item: {
        type: "order",
        body: `Your order with ID ${newOrder.id} has been created.`,
      },
      userId: userId,
    });

    console.log("pass 6");

    const operators = await prisma.user.findMany({
      where: {
        accountType: {
          not: "user",
        },
      },
    });

    console.log("pass 7");

    for (const operator of operators) {
      await CreateNotification({
        from: "VISCIO System",
        avatar: "/main.png",
        type: "order",
        item: {
          type: "order",
          body: `A new order with ID ${newOrder.id} has been created.`,
        },
        userId: operator.id,
      });
    }

    console.log("pass 8");

    return res.status(201).json({
      message: "Order has been created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getOrders = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = getUserIdFromToken(authHeader);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
    }
    const orders = await prisma.order.findMany({
      where: {
        userId,
      },
      include: {
        bids: true,
      },
    });
    return res.status(200).json({
      message: "orders",
      orders: orders,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const createBid = async (req: Request, res: Response) => {
  const { price, deliveryhour, orderId }: Bid = req.body;
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = getUserIdFromToken(authHeader);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (user.accountType === "user") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.dispatched) {
      return res.status(400).json({ error: "Order already dispatched" });
    }

    const newBid = await prisma.bids.create({
      data: {
        price,
        deliveryhour,
        orderId,
        userId,
        status: "pending",
      },
    });
    await CreateNotification({
      from: "VISCIO System",
      avatar: "/main.png",
      type: "bid",
      item: {
        type: "bid placement",
        body: `Your order with ID ${orderId} has been bided for.`,
      },
      userId: userId,
    });
    return res.status(201).json({
      message: "Bid has been placed successfully",
      bid: newBid,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getBids = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = getUserIdFromToken(authHeader);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
    }
    const bids = await prisma.bids.findMany({
      where: {
        userId,
      },
      include: {
        order: true,
      },
    });
    return res.status(200).json({
      message: "bids",
      bids: bids,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getOrderbyId = async (req: Request, res: Response) => {
  const id = req.query.id as string;
  if (!id) {
    return res.status(400).json({ message: "Id is needed" });
  }
  
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = getUserIdFromToken(authHeader);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
    }
    const order = await prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        bids: {
          include: {
            bidder: true,
          }
        }
      },
    });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    return res.status(200).json({
      message: "order",
      order: order,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getBidsbyId = async (req: Request, res: Response) => {
  const id = req.query.id as string;
  if (!id) {
    return res.status(400).json({ message: "Id is needed" });
  }
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = getUserIdFromToken(authHeader);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
    }
    const bids = await prisma.bids.findMany({
      where: {
        orderId: id,
      },
      include: {
        order: true,
      },
    });
    if (!bids) {
      return res.status(404).json({ error: "Bids not found" });
    }
    return res.status(200).json({
      message: "bids",
      bids: bids,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllOrders = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const orders = await prisma.order.findMany({
      include: {
        bids: true,
      },
    });
    return res.status(200).json({
      message: "orders",
      orders: orders,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export {
  createOrder,
  getOrders,
  createBid,
  getBids,
  getBidsbyId,
  getOrderbyId,
  getAllOrders,
};
