import React, { useState } from 'react';
import { supabase } from '../services/supabaseService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { User } from '../types';

const TokenCheckerPage: React.FC = () => {
    const [nisn, setNisn] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ message: string; isError: boolean, token?: string } | null>(null);

    const handleCheckToken = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        const { data, error } = await supabase.from('users').select('token, full_name').eq('nisn', nisn).single();
        
        if (error || !data) {
            setResult({ message: 'Data tidak ditemukan. Silakan hubungi admin SOC.', isError: true });
        } else {
            const user = data as User;
            setResult({ 
                message: `Token untuk ${user.full_name}:`, 
                isError: false,
                token: user.token
            });
        }
        
        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-soc-navy to-gray-800 p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-soc-white rounded-2xl shadow-2xl">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-soc-navy">Check Your Token</h1>
                    <p className="text-soc-gray">Enter your NISN to retrieve your login token.</p>
                </div>

                <form className="space-y-4" onSubmit={handleCheckToken}>
                    <div>
                        <label htmlFor="nisn" className="text-sm font-medium text-soc-gray">
                            Masukkan NISN Anda
                        </label>
                        <input
                            id="nisn"
                            name="nisn"
                            type="text"
                            value={nisn}
                            onChange={(e) => setNisn(e.target.value)}
                            required
                            className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-soc-gold"
                            placeholder="e.g., 1001"
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 rounded-lg shadow-sm font-medium text-white bg-soc-navy hover:bg-opacity-90 disabled:bg-soc-gray transition-colors"
                        >
                            {loading ? <LoadingSpinner /> : 'Check Token'}
                        </button>
                    </div>
                </form>

                {result && (
                    <div className={`p-4 rounded-md text-center ${result.isError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        <p>{result.message}</p>
                        {result.token && (
                            <p className="text-2xl font-bold font-mono tracking-widest mt-2 bg-white/50 p-2 rounded">{result.token}</p>
                        )}
                    </div>
                )}
                 <div className="text-center">
                    <a href="#/" className="text-sm text-soc-gold hover:underline">&larr; Back to login</a>
                </div>
            </div>
        </div>
    );
};

export default TokenCheckerPage;
