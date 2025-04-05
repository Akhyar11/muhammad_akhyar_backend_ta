import axios from "axios";
import { Request, Response } from "express";

export default class OKXController {
  // === GET MARKET DATA FROM OKX ===
  async getMarketData(req: Request, res: Response) {
    const { instId, bar = "1h", limit = "100" } = req.query;

    if (!instId) {
      res.status(400).json({ message: "Parameter 'instId' is required" });
      return;
    }

    try {
      const url = `https://www.okx.com/api/v5/market/candles?instId=${instId}&bar=${bar}&limit=${
        Number(limit) * 2
      }`;

      const response = await axios.get(url);
      const candles = response.data?.data;

      if (!candles || candles.length === 0) {
        res.status(404).json({ message: "No candle data returned from OKX" });
        return;
      }

      const data = candles
        .map((candle: string[]) => ({
          timestamp: parseInt(candle[0]),
          open: parseFloat(candle[1]),
          high: parseFloat(candle[2]),
          low: parseFloat(candle[3]),
          close: parseFloat(candle[4]),
          volume: parseFloat(candle[5]),
        }))
        .reverse(); // Make it oldest -> newest

      res.status(200).json({ data });
      return;
    } catch (error: any) {
      console.error("Error fetching market data:", error?.message);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // === SEND WEBHOOK TO YOUR TRADING SYSTEM ===
  async sendWebhook(req: Request, res: Response) {
    const {
      action,
      symbol,
      signalToken,
      amount,
      webhookUrl = "https://www.okx.com/algo/signal/trigger",
      maxLag = 0,
    } = req.body;

    if (!action || !symbol || !signalToken || !amount) {
      res.status(400).json({ message: "Missing required parameters" });
      return;
    }

    const payload = {
      action,
      instrument: symbol,
      signalToken,
      timestamp: Date.now().toString(),
      maxLag,
      orderType: "market",
      orderPriceOffset: "",
      investmentType:
        action === "ENTER_LONG" ? "percentage_balance" : "percentage_position",
      amount,
    };

    try {
      const response = await axios.post(webhookUrl, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      res.status(200).json({
        message: `Webhook ${action} sent successfully`,
        response: response.data,
      });
      return;
    } catch (error: any) {
      console.error(`Error sending ${action} webhook:`, error?.message);
      res.status(500).json({ message: "Failed to send webhook" });
      return;
    }
  }
}
