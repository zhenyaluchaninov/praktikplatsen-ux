import { useEffect, useMemo, useState } from 'react';

import type { Placement } from '../types/placement';

const clearbitLogo = (domain: string, size = 256) => {
  const target = `logo.clearbit.com/${domain}?size=${size}`;
  const encoded = encodeURIComponent(target);
  return `https://images.weserv.nl/?url=${encoded}&w=${size}&h=${size}&fit=inside&il`;
};

const companyLogoOverrides: Record<string, string[]> = {
  'Espresso House': [clearbitLogo('espressohouse.com')],
  'Angered Care Center': [clearbitLogo('vgregion.se')],
  'H&M Angered': [clearbitLogo('hm.com')],
  'Digital Dreams AB': [clearbitLogo('spotify.com')],
  'Max Burgers': [clearbitLogo('max.se')],
  'Apoteket Hjartat': [clearbitLogo('apotekhjartat.se')],
  'Creative Studio': [clearbitLogo('behance.net')],
  PostNord: [clearbitLogo('postnord.com')],
  'Skanska Build': [clearbitLogo('skanska.com')],
  'Gothenburg City Library': [clearbitLogo('goteborg.se')],
  'Solgarden Preschool': [clearbitLogo('pysslingen.se')],
  QuickDrop: [clearbitLogo('bring.com')],
  'Nordic Tech Hub': [clearbitLogo('klarna.com')],
  'Nordstan Fashion': [clearbitLogo('lindex.com')],
  'Bean Works': [clearbitLogo('beanworks.com')],
  'Sahlgrenska Support': [clearbitLogo('sahlgrenska.se')],
  'WestCoast Media': [clearbitLogo('viaplaygroup.com')],
  'Vasttrafik Depot': [clearbitLogo('vasttrafik.se')],
  'Lundby Senior Living': [clearbitLogo('humana.se')],
  'City Parks Unit': [clearbitLogo('treepeople.org')],
  'NextGen Apps': [clearbitLogo('vercel.com')],
  'Grynet School': [clearbitLogo('folkuniversitetet.se')],
  'SmileCare Angered': [clearbitLogo('smile.se')],
  'Radio Angered': [clearbitLogo('sverigesradio.se')],
  'BuildRight AB': [clearbitLogo('peab.se')],
  'Gothenburg History': [clearbitLogo('goteborgsstadsmuseum.se')],
  CareCall: [clearbitLogo('1177.se')],
  FutureLab: [clearbitLogo('ri.se')],
  'Gota Terminal': [clearbitLogo('portofgothenburg.com')],
  'Warm Cup Collective': [clearbitLogo('damatteo.se')],
};

const industryDomainPools: Record<Placement['industry'] | 'default', string[]> = {
  cafe: ['espressohouse.com', 'costacoffee.com', 'pret.com'],
  retail: ['hm.com', 'cosstores.com', 'lindex.com'],
  tech: ['spotify.com', 'vercel.com', 'klarna.com'],
  healthcare: ['apotekhjartat.se', '1177.se', 'humana.se'],
  media: ['sverigesradio.se', 'viaplaygroup.com', 'bbc.co.uk'],
  transport: ['postnord.com', 'bring.com', 'vasttrafik.se'],
  construction: ['skanska.com', 'peab.se', 'ncc.se'],
  education: ['folkuniversitetet.se', 'goteborg.se', 'pysslingen.se'],
  default: ['goteborg.se', 'google.com'],
};

const domainSources = (domain: string) => [clearbitLogo(domain), `https://www.google.com/s2/favicons?sz=128&domain=${domain}`];

const buildLogoSources = (placement: Placement) => {
  const overrideSources = companyLogoOverrides[placement.company] ?? [];
  const pool = industryDomainPools[placement.industry] ?? industryDomainPools.default;
  const domain = pool.length ? pool[placement.id % pool.length] : undefined;
  const fallbackSources = domain ? domainSources(domain) : [];
  return [...overrideSources, ...fallbackSources];
};

export const LogoImage = ({ placement }: { placement: Placement }) => {
  const [sourceIndex, setSourceIndex] = useState(0);
  const sources = useMemo(() => buildLogoSources(placement), [placement.company, placement.id, placement.industry]);

  useEffect(() => {
    setSourceIndex(0);
  }, [sources]);

  if (!sources.length || sourceIndex >= sources.length) {
    return <span aria-hidden="true">{placement.logo}</span>;
  }

  return (
    <img
      src={sources[sourceIndex]}
      alt={`${placement.company} logo`}
      loading="lazy"
      onError={() => setSourceIndex((prev) => prev + 1)}
      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
    />
  );
};

