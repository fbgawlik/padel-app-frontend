import { theme } from '../theme';

export const styles = {
  contenedor: { width: '100%', boxSizing: 'border-box', padding: '0 20px 32px 20px' },
  botonVolver: { 
    display: 'flex', alignItems: 'center', backgroundColor: 'transparent', 
    color: '#8A8A8A', border: 'none', cursor: 'pointer', marginBottom: '24px', 
    fontSize: '14px', fontWeight: '600', padding: 0, transition: 'color 0.2s' 
  },
  headerClub: { borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '24px', marginBottom: '32px' },
  tituloClub: { fontSize: '32px', margin: '0 0 8px 0', fontWeight: '800', letterSpacing: '-0.5px', color: '#fff' },
  infoClub: { color: '#8A8A8A', fontSize: '15px', margin: 0 },
  
  grillaProductos: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' },
  
  tarjetaProducto: { 
    backgroundColor: '#121212', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)', 
    display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'transform 0.2s'
  },
  headerTarjetaProducto: { padding: '16px 16px 0 16px', display: 'flex', justifyContent: 'flex-end' },
  badgeTipo: { fontSize: '10px', fontWeight: '800', padding: '4px 8px', borderRadius: '6px', letterSpacing: '0.5px' },
  
  imagenPlaceholder: { 
    height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
    fontSize: '48px', opacity: 0.8
  },
  
  infoProductoContainer: { padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', flex: 1 },
  nombreProducto: { color: '#fff', fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0', letterSpacing: '-0.3px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' },
  precioProducto: { color: '#EAEAEA', fontSize: '20px', fontWeight: '800', marginBottom: '16px' },
  
  stockContenedor: { marginTop: 'auto', marginBottom: '20px' },
  badgeStock: { fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px' },
  
  botonAccion: { 
    width: '100%', padding: '16px', border: 'none', fontWeight: '700', fontSize: '14px', 
    transition: 'all 0.2s', marginTop: 'auto' 
  },
  
  estadoVacio: { 
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
    padding: '80px 20px', color: '#8A8A8A', fontSize: '16px', backgroundColor: '#121212',
    borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.05)'
  },
  spinner: { 
    width: '30px', height: '30px', border: '3px solid rgba(0,255,102,0.2)', 
    borderTop: '3px solid #00ff66', borderRadius: '50%', animation: 'spin 1s linear infinite', 
    marginBottom: '16px' 
  }
}