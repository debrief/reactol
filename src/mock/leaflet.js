module.exports = {
    LatLngBounds: jest.fn(),
    map: jest.fn(() => ({
      setView: jest.fn(),
      addLayer: jest.fn(),
    })),
    tileLayer: jest.fn(() => ({
      addTo: jest.fn(),
    })),
    marker: jest.fn(() => ({
      addTo: jest.fn(),
    })),
  };