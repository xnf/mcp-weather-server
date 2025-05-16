'use client';

import { trpc } from '@/utils/trpc';
import { useState } from 'react';

// Example queries for the natural language interface
const EXAMPLE_QUERIES = [
  // English examples
  "What's the current temperature?",
  "Show me the humidity for the next 3 hours",
  "When will it rain?",
  "What's the wind speed and direction?",
  "How cloudy is it?",
  "What's the air pressure?",
  // Latvian examples
  "Kāda ir pašreizējā temperatūra?",
  "Rādi mitrumu nākamās 3 stundas",
  "Kad būs lietus?",
  "Kāds ir vēja ātrums un virziens?",
  "Cik daudz mākoņu?",
  "Kāds ir gaisa spiediens?"
];

export default function Home() {
  const [query, setQuery] = useState('');
  const [queryError, setQueryError] = useState<string | null>(null);
  
  const currentWeather = trpc.getCurrentWeather.useQuery();
  const hourlyForecast = trpc.getHourlyForecast.useQuery({ hours: 24 });
  const naturalLanguageQuery = trpc.naturalLanguageQuery.useMutation({
    onError: (error) => setQueryError(error.message),
    onSuccess: () => setQueryError(null),
  });

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      naturalLanguageQuery.mutate({ query: query.trim() });
    }
  };

  if (currentWeather.isLoading || hourlyForecast.isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (currentWeather.error || hourlyForecast.error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Error loading weather data. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  if (!currentWeather.data || !hourlyForecast.data) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
            No weather data available.
          </div>
        </div>
      </div>
    );
  }

  const current = currentWeather.data;
  const hourly = hourlyForecast.data;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Weather Forecast</h1>
        
        {/* Natural Language Query Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Ask About the Weather</h2>
          <form onSubmit={handleQuerySubmit} className="space-y-4">
            <div>
              <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
                Ask a question about the weather in natural language
              </label>
              <textarea
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="e.g., What's the current temperature?"
              />
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {EXAMPLE_QUERIES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setQuery(example)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  {example}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <button
                type="submit"
                disabled={naturalLanguageQuery.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {naturalLanguageQuery.isPending ? 'Processing...' : 'Ask'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setQueryError(null);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </div>
          </form>
          
          {queryError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {queryError}
            </div>
          )}
          
          {naturalLanguageQuery.data && (
            <div className="mt-4 space-y-4">
              <div className="text-sm text-gray-500">
                <p>Interpreted as: <code className="bg-gray-100 px-2 py-1 rounded">{naturalLanguageQuery.data.interpretedQuery}</code></p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-md">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">English Response:</h3>
                  <p className="text-blue-900">{naturalLanguageQuery.data.humanReadable.en}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-md">
                  <h3 className="text-lg font-medium text-green-800 mb-2">Latvian Response:</h3>
                  <p className="text-green-900">{naturalLanguageQuery.data.humanReadable.lv}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Raw Data:</h3>
                <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-sm text-black">
                  {JSON.stringify(naturalLanguageQuery.data.result, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Current Weather Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Weather</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Temperature</p>
              <p className="text-2xl font-bold">{current.temperature}°C</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Humidity</p>
              <p className="text-2xl font-bold">{current.humidity}%</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Wind Speed</p>
              <p className="text-2xl font-bold">{current.windSpeed} m/s</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Pressure</p>
              <p className="text-2xl font-bold">{current.pressure} hPa</p>
            </div>
          </div>
        </div>

        {/* Hourly Forecast */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">24-Hour Forecast</h2>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-24 gap-4 min-w-max">
              {hourly.map((hour) => (
                <div key={hour.time} className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-500">
                    {new Date(hour.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-lg font-semibold">{hour.temperature}°C</p>
                  <p className="text-sm text-gray-600">{hour.symbol}</p>
                  {hour.precipitation > 0 && (
                    <p className="text-sm text-blue-600">{hour.precipitation}mm</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
