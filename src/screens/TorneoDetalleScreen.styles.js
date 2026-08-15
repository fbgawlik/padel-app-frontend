import { theme } from '../theme';

export const styles = {
  screenContainer: {
    paddingBottom: theme.spacing.bottomNavPadding,
    backgroundColor: 'var(--bg-background)',
    width: '100%',
    boxSizing: 'border-box',
    color: 'var(--text-primary)',
    position: 'relative'
  },
  headerHero: {
    position: 'relative',
    height: '240px',
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  },
  headerOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to bottom, var(--bg-surface) 0%, var(--bg-background) 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  topBar: { display: 'flex', alignItems: 'center', padding: '16px 20px', gap: '12px' },
  backButton: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    borderRadius: '12px',
    outline: 'none'
  },
  logoContainer: { display: 'flex', alignItems: 'center', gap: '8px' },
  logoIcon: { width: '22px', height: '22px', borderRadius: '4px' },
  logoText: { color: 'var(--text-primary)', fontWeight: '800', fontSize: '13px', letterSpacing: '1px' },
  heroTitles: { padding: '0 20px', display: 'flex', flexDirection: 'column' },
  etiquetaTorneo: { color: 'var(--brand-primary)', fontSize: '11px', fontWeight: '700', letterSpacing: '1.5px', marginBottom: '4px' },
  tituloTorneo: { color: 'var(--text-primary)', fontSize: '26px', fontWeight: '900', margin: 0, textTransform: 'uppercase', letterSpacing: '-0.5px' },
  tabsMenu: { display: 'flex', padding: '0 20px', borderBottom: '1px solid var(--border-default)' },
  tabItem: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    borderBottom: '3px solid transparent',
    color: 'var(--text-secondary)',
    padding: '14px 0',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    letterSpacing: '0.5px',
    transition: 'all 0.2s'
  },
  tabItemActivo: { color: 'var(--brand-primary)', borderBottom: '3px solid var(--brand-primary)' },
  mainContent: { padding: '24px 20px 160px 20px' },
  tabSection: { display: 'flex', flexDirection: 'column', gap: '16px' },

  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '12px',
    marginBottom: '8px'
  },
  infoCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '16px',
    borderRadius: '12px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    boxShadow: 'var(--shadow-soft)',
    minHeight: '118px'
  },
  infoIconWrap: {
    width: '32px',
    height: '32px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg-strong)'
  },
  infoIcon: { fontSize: '20px' },
  infoLabel: { fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' },
  infoValue: { fontSize: '15px', color: 'var(--text-primary)', fontWeight: '700', lineHeight: '1.3' },

  sectionHeaderRow: { marginTop: '8px' },
  sectionTitle: { margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '0.08em' },
  categoryList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  categoryCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    borderRadius: '12px',
    padding: '14px 16px',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-soft)'
  },
  categoryLeft: { display: 'flex', alignItems: 'center', gap: '12px', flex: 1 },
  categoryIcon: { fontSize: '18px' },
  categoryTextWrap: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' },
  categoryTitle: { fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' },
  categoryMeta: { fontSize: '11px', color: 'var(--text-secondary)' },
  categoryAction: { display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' },
  categoryActionText: { fontSize: '11px', fontWeight: '800', letterSpacing: '0.12em' },
  categoryActionArrow: { fontSize: '20px', lineHeight: 1 },

  detailPanel: { display: 'flex', flexDirection: 'column', gap: '16px' },
  categoryHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' },
  categoryTitleBlock: { flex: 1 },
  categoryHeading: { margin: 0, fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' },
  statusBadge: {
    padding: '6px 10px',
    borderRadius: '999px',
    backgroundColor: 'var(--brand-soft)',
    color: 'var(--brand-primary)',
    border: '1px solid var(--border-strong)',
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '0.08em'
  },

  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '0 12px',
    height: '46px',
    borderRadius: '12px',
    border: '1px solid var(--border-default)',
    backgroundColor: 'var(--bg-surface)',
    boxShadow: 'var(--shadow-soft)'
  },
  searchIcon: { fontSize: '18px', color: 'var(--text-secondary)' },
  searchInput: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    outline: 'none',
    color: 'var(--text-primary)',
    fontSize: '14px'
  },

  subTabsRow: { display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-default)' },
  subTabButton: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    padding: '12px 6px',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    fontWeight: '700',
    fontSize: '13px',
    borderBottom: '2px solid transparent'
  },
  subTabButtonActive: {
    color: 'var(--text-primary)',
    borderBottom: '2px solid var(--brand-primary)'
  },

  chipRow: { display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' },
  chip: {
    flexShrink: 0,
    borderRadius: '999px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    cursor: 'pointer'
  },
  chipActive: {
    backgroundColor: 'var(--bg-strong)',
    borderColor: 'var(--border-strong)',
    color: 'var(--text-primary)'
  },

  matchList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  matchCardDetail: {
    display: 'flex',
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '16px',
    border: '1px solid var(--border-default)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-soft)'
  },
  timeColumnDetail: {
    width: '76px',
    backgroundColor: 'var(--bg-elevated)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRight: '1px solid var(--border-default)'
  },
  timeDetail: { fontSize: '16px', fontWeight: '800', color: 'var(--brand-primary)' },
  matchContent: { flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' },
  badgeRowDetail: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  stateBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 8px',
    borderRadius: '999px',
    backgroundColor: 'var(--bg-strong)',
    color: 'var(--brand-primary)',
    fontSize: '9px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.08em'
  },
  teamsRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' },
  teamGroup: { display: 'flex', alignItems: 'center', gap: '8px', flex: 1 },
  teamLabel: { fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700' },
  teamName: { fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' },
  scoreGroup: { display: 'flex', alignItems: 'center', gap: '4px', minWidth: '48px', justifyContent: 'center' },
  scoreValue: { fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' },
  scoreSeparator: { fontSize: '12px', color: 'var(--text-secondary)' },
  scorePlaceholder: { fontSize: '15px', color: 'var(--text-secondary)' },
  matchFooter: { display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '8px', borderTop: '1px solid var(--border-default)' },
  locationIcon: { fontSize: '12px' },
  locationTextDetail: { fontSize: '11px', color: 'var(--text-secondary)' },

  zonesList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  zoneCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '16px',
    border: '1px solid var(--border-default)',
    padding: '16px',
    boxShadow: 'var(--shadow-soft)'
  },
  zoneHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  zoneTitle: { fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' },
  positionsTable: { borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-default)' },
  positionsHeader: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    padding: '10px 12px',
    backgroundColor: 'var(--bg-elevated)',
    fontSize: '10px',
    fontWeight: '800',
    color: 'var(--text-secondary)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase'
  },
  tableLabel: { textAlign: 'left' },
  tableLabelRight: { textAlign: 'right' },
  positionRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    alignItems: 'center',
    padding: '10px 12px',
    borderTop: '1px solid var(--border-default)',
    backgroundColor: 'var(--bg-background)'
  },
  parejaName: { fontSize: '13px', color: 'var(--text-primary)', fontWeight: '700' },
  puntosValue: { fontSize: '13px', color: 'var(--text-primary)', fontWeight: '800', textAlign: 'right' },
  zoneMatchesList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  zoneMatchItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '10px',
    backgroundColor: 'var(--bg-background)',
    border: '1px solid var(--border-default)'
  },
  locationPin: { fontSize: '12px' },
  zoneMatchTextWrap: { display: 'flex', flexDirection: 'column', flex: 1 },
  zoneMatchTeams: { fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' },
  zoneMatchMeta: { fontSize: '10px', color: 'var(--text-secondary)' },
  zoneResult: { fontSize: '12px', fontWeight: '800', color: 'var(--brand-primary)' },

  bracketWrap: { overflow: 'auto', paddingBottom: '8px' },
  bracketBoard: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(150px, 1fr))',
    gap: '16px',
    minWidth: '420px',
    alignItems: 'stretch'
  },
  bracketNode: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '12px',
    border: '1px solid var(--border-default)',
    padding: '12px',
    boxShadow: 'var(--shadow-soft)',
    position: 'relative'
  },
  nodeMeta: { fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700' },
  nodeState: { fontSize: '9px', color: 'var(--brand-primary)', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase' },
  nodeTeam: { fontSize: '12px', color: 'var(--text-primary)', fontWeight: '700' },

  centerContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', flexDirection: 'column' },
  spinner: { width: '32px', height: '32px', border: '3px solid var(--bg-strong)', borderTopColor: 'var(--brand-primary)', borderRadius: '50%' },
  alerta: { padding: '20px', backgroundColor: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-default)', textAlign: 'center' },
  btnVolver: { marginTop: '12px', padding: '8px 16px', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-default)', borderRadius: '8px', cursor: 'pointer', outline: 'none' },
  noMatches: { textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)', fontSize: '13px' },

  fixedActionContainer: {
    position: 'fixed',
    bottom: '96px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '460px',
    padding: '0 20px',
    boxSizing: 'border-box',
    zIndex: 999
  },
  btnInscribirse: {
    width: '100%',
    height: '54px',
    backgroundColor: 'var(--brand-primary)',
    border: 'none',
    borderRadius: '18px',
    color: 'var(--bg-background)',
    fontSize: '15px',
    fontWeight: '800',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    boxShadow: 'var(--shadow-soft)',
    transition: 'transform 0.2s ease',
    outline: 'none'
  },
  precioBadge: {
    backgroundColor: 'var(--bg-surface)',
    padding: '6px 12px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '900'
  },
  badgeCerrado: {
    width: '100%',
    height: '50px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    borderRadius: '18px',
    color: 'var(--text-secondary)',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  badgeInscripto: {
    width: '100%',
    minHeight: '50px',
    backgroundColor: 'var(--bg-strong)',
    border: '1px solid var(--border-strong)',
    borderRadius: '18px',
    color: 'var(--brand-primary)',
    fontSize: '13px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};
