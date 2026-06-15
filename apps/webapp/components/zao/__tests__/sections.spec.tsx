import { render } from '@testing-library/react';

import { EcosystemSection } from 'components/zao/EcosystemSection';
import { MusicSection } from 'components/zao/MusicSection';
import { ZabalGamesSection } from 'components/zao/ZabalGamesSection';
import { Zao101Section } from 'components/zao/Zao101Section';
import { mockCurrentSpaceContext } from 'lib/testing/mocks/useCurrentSpace';

// Button (used in some sections) reads useCurrentSpace.
vi.mock('hooks/useCurrentSpace', () => ({
  useCurrentSpace: vi.fn(() => mockCurrentSpaceContext())
}));

// Pure-presentation sections driven by @packages/config/zao. Smoke tests guard
// against config-shape regressions breaking the /learn hub.
describe('ZAO content sections render', () => {
  it('MusicSection shows the music-first heading', () => {
    const { getByText } = render(<MusicSection />);
    expect(getByText('Music first')).toBeDefined();
  });

  it('Zao101Section shows the pillars heading', () => {
    const { getByText } = render(<Zao101Section />);
    expect(getByText('ZAO 101')).toBeDefined();
    expect(getByText('The four pillars')).toBeDefined();
  });

  it('ZabalGamesSection shows the program + the three tracks', () => {
    const { getByText } = render(<ZabalGamesSection />);
    expect(getByText('ZABAL Games')).toBeDefined();
    expect(getByText('Artist')).toBeDefined();
    expect(getByText('Builder')).toBeDefined();
    expect(getByText('Creator')).toBeDefined();
  });

  it('EcosystemSection shows the ecosystem heading + a known product', () => {
    const { getByText } = render(<EcosystemSection />);
    expect(getByText('The ecosystem')).toBeDefined();
    expect(getByText('WaveWarZ')).toBeDefined();
  });
});
