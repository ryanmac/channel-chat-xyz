// utils/boostManagement.ts
import prisma from '../lib/prisma';
import { getChannelCredits, updateChannelCredits } from './creditManagement';

export async function purchaseBoost(channelId: string, boostType: string): Promise<boolean> {
  const boostCostSetting = await prisma.configurationSetting.findUnique({
    where: { key: `${boostType.toUpperCase()}_BOOST_COST` },
  });
  const boostCost = boostCostSetting ? parseInt(boostCostSetting.value) : 0;

  if (boostCost === 0) {
    throw new Error('Invalid boost type');
  }

  const channelCredits = await getChannelCredits(channelId);

  if (channelCredits < boostCost) {
    return false; // Not enough credits
  }

  await updateChannelCredits(channelId, -boostCost);

  await prisma.channelBoost.create({
    data: {
      channelId,
      boostType,
      value: 1, // You might want to adjust this based on the boost type
    },
  });

  return true;
}