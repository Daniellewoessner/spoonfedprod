const ErrorPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center" style={{ backgroundColor: 'var(--cream-bg)' }}>
      <section className="max-w-2xl mx-auto">
        <h1 
          className="text-2xl font-semibold mb-6"
          style={{ color: 'var(--text-dark)' }}
        >
          Uh-oh! Chef Spoonie Burned the Recipe!
        </h1>

        <h2 
          className="text-l mb-8"
          style={{ color: 'var(--text-dark)' }}
        >
          It looks like something went a little awry in the kitchen. Chef Spoonie might have dropped 
          the ball—or the spoon! But don't worry, we'll have you back on track in no time.
        </h2>

        <div className="mb-8">
          <img
            src="/images/chefspoonie.png"
            alt="Chef Spoonie looking apologetic"
            className="w-20 h-20 mx-auto rounded-full object-cover"
            style={{
              border: '4px solid #FFFFFF',
              boxShadow: '0 10px 25px rgba(74, 120, 86, 0.15)',
              transition: 'transform 0.3s ease'
            }}
          />
        </div>

     
        <a 
          href="/" 
          className="inline-block px-6 py-3 text-lg font-medium rounded-lg transition-colors duration-200 hover:bg-accent-orange"
          style={{ 
            backgroundColor: 'var(--primary-teal)',
            color: '#FFFFFF'
          }}
        >
          Return to Home Page
        </a>
      </section>
    </div>
  );
};

export default ErrorPage;