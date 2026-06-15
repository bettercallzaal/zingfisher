import { render } from '@testing-library/react';

import { useZaoMembership } from 'charmClient/hooks/zao';
import { ZaoMemberGate } from 'components/zao/ZaoMemberGate';
import { useUser } from 'hooks/useUser';
import { mockCurrentSpaceContext } from 'lib/testing/mocks/useCurrentSpace';

vi.mock('hooks/useCurrentSpace', () => ({
  useCurrentSpace: vi.fn(() => mockCurrentSpaceContext())
}));
vi.mock('hooks/useUser', () => ({ useUser: vi.fn() }));
vi.mock('charmClient/hooks/zao', () => ({ useZaoMembership: vi.fn() }));

// Loose mock typing so partial return values are accepted (runtime-only shape).
const mockUseUser = useUser as unknown as ReturnType<typeof vi.fn>;
const mockUseZaoMembership = useZaoMembership as unknown as ReturnType<typeof vi.fn>;

const withWallet = { user: { wallets: [{ address: '0xabc0000000000000000000000000000000000001' }] } };
const noWallet = { user: { wallets: [] } };

describe('ZaoMemberGate', () => {
  it('renders children for a member', () => {
    mockUseUser.mockReturnValue(withWallet);
    mockUseZaoMembership.mockReturnValue({ data: { member: true, results: [] }, isLoading: false });

    const { getByText, queryByText } = render(
      <ZaoMemberGate>
        <div>secret member content</div>
      </ZaoMemberGate>
    );
    expect(getByText('secret member content')).toBeDefined();
    expect(queryByText('ZAO members only')).toBeNull();
  });

  it('shows the join CTA for a non-member', () => {
    mockUseUser.mockReturnValue(withWallet);
    mockUseZaoMembership.mockReturnValue({ data: { member: false, results: [] }, isLoading: false });

    const { getByText, queryByText } = render(
      <ZaoMemberGate>
        <div>secret member content</div>
      </ZaoMemberGate>
    );
    expect(getByText('ZAO members only')).toBeDefined();
    expect(queryByText('secret member content')).toBeNull();
  });

  it('shows the connect-wallet prompt when no wallet is connected', () => {
    mockUseUser.mockReturnValue(noWallet);
    mockUseZaoMembership.mockReturnValue({ data: undefined, isLoading: false });

    const { getByText } = render(
      <ZaoMemberGate>
        <div>secret member content</div>
      </ZaoMemberGate>
    );
    expect(getByText(/Connect a wallet/i)).toBeDefined();
  });

  it('renders the custom fallback for a non-member when provided', () => {
    mockUseUser.mockReturnValue(withWallet);
    mockUseZaoMembership.mockReturnValue({ data: { member: false, results: [] }, isLoading: false });

    const { getByText, queryByText } = render(
      <ZaoMemberGate fallback={<div>custom fallback</div>}>
        <div>secret member content</div>
      </ZaoMemberGate>
    );
    expect(getByText('custom fallback')).toBeDefined();
    expect(queryByText('ZAO members only')).toBeNull();
  });
});
