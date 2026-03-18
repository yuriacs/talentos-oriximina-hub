import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { ProfilesPreview } from '@/components/home/ProfilesPreview';
import { CTASection } from '@/components/home/CTASection';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <ProfilesPreview />
      <FeaturesSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
