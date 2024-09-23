// hooks/useTransactionImpact.ts
import { useState, useEffect } from 'react';
import { Channel } from '@prisma/client'; // Assuming this type is available for frontend use; otherwise, replace it with the appropriate type.

interface ImpactData {
  before: {
    activation: number;
    credits: number;
    total: number;
    activationInDollars: number;
    creditsInDollars: number;
  };
  contribution: {
    activation: number;
    credits: number;
    total: number;
    activationInDollars: number;
    creditsInDollars: number;
  };
  after: {
    activation: number;
    credits: number;
    total: number;
    activationInDollars: number;
    creditsInDollars: number;
  };
}

export function useTransactionImpact(channelData: Channel | null, amount: number): ImpactData | null {
  const [impactData, setImpactData] = useState<ImpactData | null>(null);
  const creditsPerDollar = 1000; // Default value; adjust as needed based on business logic.

  useEffect(() => {
    if (!channelData) return;

    const calculateFundingImpact = () => {
      const numericAmount = Number(amount);
      const remainingToActivate = Math.max(0, channelData.activationGoal - channelData.activationFunding);
      const activationContribution = Math.min(numericAmount, remainingToActivate);
      const wouldActivate = channelData.activationFunding + activationContribution >= channelData.activationGoal;
      const creditContribution = Math.max(0, numericAmount - activationContribution) * creditsPerDollar + (wouldActivate ? creditsPerDollar : 0);

      // Mock before data: assumes current channel funding state
      const before = {
        activation: channelData.activationFunding,
        credits: channelData.creditBalance || 0,
        total: channelData.activationFunding + (channelData.creditBalance || 0) / creditsPerDollar,
        activationInDollars: channelData.activationFunding,
        creditsInDollars: (channelData.creditBalance || 0) / creditsPerDollar,
      };

      // Contribution details based on the current transaction
      const contribution = {
        activation: activationContribution,
        credits: creditContribution,
        total: numericAmount,
        activationInDollars: activationContribution,
        creditsInDollars: creditContribution / creditsPerDollar,
      };

      // After impact data: new state after contribution is applied
      const after = {
        activation: before.activation + activationContribution,
        credits: before.credits + creditContribution,
        total: before.total + numericAmount,
        activationInDollars: before.activationInDollars + activationContribution,
        creditsInDollars: before.creditsInDollars + creditContribution / creditsPerDollar,
      };

      setImpactData({ before, contribution, after });
    };

    calculateFundingImpact();
  }, [channelData, amount, creditsPerDollar]);

  return impactData;
}