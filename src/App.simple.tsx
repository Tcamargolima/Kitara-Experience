// Minimal test component to verify React works
export default function SimpleApp() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'system-ui'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>React Works! ✓</h1>
        <p>If you see this, React is loading correctly.</p>
        <p style={{ marginTop: '1rem', color: '#666' }}>
          The bundling issue is being resolved...
        </p>
      </div>
    </div>
  );
}
