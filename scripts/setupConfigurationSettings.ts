// scripts/setupConfigurationSettings.ts
import prisma from '../lib/prisma';

async function setupConfigurationSettings() {
  const settings = [
    { key: 'CREDITS_PER_DOLLAR', value: '100', description: 'Number of credits per dollar' },
    { key: 'BASIC_BOT_COST', value: '1000', description: 'Cost in credits to activate a basic bot' },
    { key: 'EMBEDDED_VIDEOS_LIMIT', value: '20', description: 'Number of embedded videos for basic bot' },
    { key: 'TOKENS_PER_CHAT', value: '200', description: 'Number of tokens per chat for basic bot' },
    { key: 'RAG_CONTEXT_SNIPPETS', value: '5', description: 'Number of RAG context snippets for basic bot' },
    { key: 'MAX_CHAT_LENGTH', value: '10000', description: 'Maximum chat length in tokens' },
    { key: 'TRANSCRIPT_BOOST_COST', value: '2000', description: 'Cost in credits for transcript boost' },
    { key: 'MEMORY_BOOST_COST', value: '1500', description: 'Cost in credits for memory boost' },
    { key: 'FINE_TUNING_BOOST_COST', value: '10000', description: 'Cost in credits for fine-tuning boost' },
  ];

  for (const setting of settings) {
    await prisma.configurationSetting.upsert({
      where: { key: setting.key },
      update: setting,
      create: setting,
    });
  }

  console.log('Configuration settings have been set up.');
}

setupConfigurationSettings()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());