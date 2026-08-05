import { theme } from '../theme';

export const styles = {
  screenContainer: {
    paddingBottom: theme.spacing.bottomNavPadding,
    padding: '24px 20px 100px 20px',
    backgroundColor: 'transparent',
    width: '100%',
    boxSizing: 'border-box'
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'
  },
  mainTitle: {
    fontSize: '28px', fontWeight: '800', color: '#FFF', margin: 0, letterSpacing: '-0.5px'
  },
  subtitle: {
    fontSize: '14px', color: '#8E8E93', margin: '4px 0 0 0', fontWeight: '500'
  },
  searchIconButton: {
    width: '44px', height: '44px', borderRadius: '14px',
    backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
  },
  filterTabsContainer: {
    display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px'
  },
  filterTab: {
    padding: '8px 14px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)', color: '#8E8E93', fontSize: '12px',
    fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s'
  },
  filterTabActive: {
    backgroundColor: 'rgba(57, 255, 20, 0.15)', borderColor: theme.colors.primary, color: theme.colors.primary
  },
  searchContainer: {
    marginBottom: '20px', animation: 'fadeIn 0.2s ease'
  },
  searchInput: {
    width: '100%', padding: '14px 16px', borderRadius: '14px',
    backgroundColor: '#161618', border: '1px solid rgba(255,255,255,0.1)',
    color: '#FFF', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
  },
  listContainer: {
    display: 'flex', flexDirection: 'column', gap: '24px'
  },
  card: {
    backgroundColor: 'rgba(22, 22, 24, 0.7)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.04)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.24)'
  },
  cardImageContainer: {
    position: 'relative', width: '100%', height: '150px', overflow: 'hidden'
  },
  cardImage: {
    width: '100%', height: '100%', objectFit: 'cover'
  },
  cardImagePlaceholder: {
    width: '100%', height: '100%', 
    background: 'linear-gradient(135deg, #1c1c1e 0%, #2c2c2e 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: theme.colors.primary, fontWeight: '700', fontSize: '16px', padding: '20px', textAlign: 'center'
  },
  badgeGroupFlotante: {
    position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '8px', alignItems: 'center'
  },
  badgeFlotante: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '6px 12px', borderRadius: '12px', border: '1px solid',
    backdropFilter: 'blur(8px)'
  },
  badgeAmericano: {
    backgroundColor: 'rgba(255, 179, 0, 0.2)', borderColor: '#FFB300',
    color: '#FFB300', border: '1px solid', padding: '6px 12px', borderRadius: '12px',
    fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px', backdropFilter: 'blur(8px)'
  },
  statusDot: {
    width: '6px', height: '6px', borderRadius: '50%'
  },
  statusText: {
    fontSize: '11px', fontWeight: '700', letterSpacing: '0.3px'
  },
  cardBody: {
    padding: '20px'
  },
  cardTitle: {
    color: '#FFF', fontSize: '20px', fontWeight: '700', margin: '0 0 16px 0',
    textTransform: 'uppercase', letterSpacing: '0.3px'
  },
  gridDetails: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '18px'
  },
  gridItem: {
    display: 'flex', flexDirection: 'column', gap: '4px'
  },
  gridLabel: {
    color: '#8E8E93', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase'
  },
  gridValue: {
    color: '#FFF', fontSize: '13px', fontWeight: '700'
  },
  cardFooter: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '14px'
  },
  dateContainer: {
    display: 'flex', alignItems: 'center', color: '#A0A0A5', fontSize: '12px', fontWeight: '500'
  },
  btnGestionar: {
    padding: '8px 14px', borderRadius: '10px', backgroundColor: 'rgba(57, 255, 20, 0.1)',
    border: '1px solid rgba(57, 255, 20, 0.4)', color: theme.colors.primary, fontSize: '12px',
    fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
    display: 'flex', alignItems: 'center', gap: '6px'
  },
  btnVerDetalles: {
    padding: '8px 16px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', fontSize: '13px',
    fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
  },
  centerContainer: {
    display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column'
  },
  spinner: {
    width: '36px', height: '36px', border: '3px solid rgba(57, 255, 20, 0.1)',
    borderTopColor: theme.colors.primary, borderRadius: '50%', animation: 'spin 1s linear infinite'
  },
  alerta: {
    padding: '20px', backgroundColor: 'rgba(255, 77, 77, 0.05)', borderRadius: '16px',
    border: '1px solid rgba(255, 77, 77, 0.2)', textAlign: 'center'
  },
  btnReintentar: {
    marginTop: '12px', padding: '8px 16px', backgroundColor: '#ff4d4d', color: '#FFF',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
  },
  noResults: {
    textAlign: 'center', padding: '40px 20px'
  },
  fabButton: {
    position: 'fixed', bottom: '100px', right: '20px',
    width: '56px', height: '56px', borderRadius: '28px',
    backgroundColor: theme.colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 'none', boxShadow: '0 4px 16px rgba(57, 255, 20, 0.4)', cursor: 'pointer', zIndex: 999
  }
}
