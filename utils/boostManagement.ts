// utils/boostManagement.ts
import { ChannelBoostType } from '@prisma/client';
import prisma from '../lib/prisma';
import { getChannelCredits } from './transactionManagement';

export async function purchaseBoost(channelId: string, boostType: string, amount: number): Promise<boolean> {
  if (boostType === 'ACTIVATION') {
    return await handleActivationBoost(channelId, amount);
  }
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

  // await updateChannelCredits(channelId, -boostCost);
  // TODO: Implement updateChannelCredits function

  await prisma.channelBoost.create({
    data: {
      channelId,
      boostType: boostType as ChannelBoostType,
      value: 1, // You might want to adjust this based on the boost type
    },
  });

  return true;
}

async function handleActivationBoost(channelId: string, amount: number, boostType: string = 'MEMORY'): Promise<boolean> {
  const channel = await prisma.channel.findUnique({ where: { id: channelId } });
  if (!channel) throw new Error('Channel not found');

  const newActivationFunding = channel.activationFunding + amount;

  await prisma.channel.update({
    where: { id: channelId },
    data: { 
      activationFunding: newActivationFunding,
      status: newActivationFunding >= channel.activationGoal ? 'ACTIVE' : 'PENDING',
    }
  });

  await prisma.channelBoost.create({
    data: {
      channelId,
      boostType: boostType as ChannelBoostType,
      value: amount,
    },
  });

  return newActivationFunding >= channel.activationGoal;
}

export async function isChannelActive(channelId: string): Promise<boolean> {
  const channel = await prisma.channel.findUnique({ where: { id: channelId } });
  return channel ? channel.status == 'ACTIVE' : false;
}