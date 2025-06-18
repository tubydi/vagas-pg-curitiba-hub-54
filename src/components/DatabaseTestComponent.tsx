
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const DatabaseTestComponent = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const { toast } = useToast();

  const testDatabaseConnection = async () => {
    setTesting(true);
    setResults([]);
    const testResults: any[] = [];

    try {
      // Test 1: Basic connection
      testResults.push({ test: 'Basic Connection', status: 'starting' });
      setResults([...testResults]);

      const { data: basicTest, error: basicError } = await supabase
        .from('companies')
        .select('id, name')
        .limit(1);

      if (basicError) {
        testResults[testResults.length - 1] = { 
          test: 'Basic Connection', 
          status: 'failed', 
          error: basicError.message 
        };
      } else {
        testResults[testResults.length - 1] = { 
          test: 'Basic Connection', 
          status: 'success', 
          data: basicTest 
        };
      }
      setResults([...testResults]);

      // Test 2: Auth status
      testResults.push({ test: 'Auth Status', status: 'starting' });
      setResults([...testResults]);

      const { data: { user } } = await supabase.auth.getUser();
      testResults[testResults.length - 1] = { 
        test: 'Auth Status', 
        status: user ? 'success' : 'failed',
        data: user ? { id: user.id, email: user.email } : 'No user logged in'
      };
      setResults([...testResults]);

      // Test 3: Jobs table access
      if (user) {
        testResults.push({ test: 'Jobs Table Access', status: 'starting' });
        setResults([...testResults]);

        const { data: jobsTest, error: jobsError } = await supabase
          .from('jobs')
          .select('id, title, status')
          .limit(1);

        if (jobsError) {
          testResults[testResults.length - 1] = { 
            test: 'Jobs Table Access', 
            status: 'failed', 
            error: jobsError.message 
          };
        } else {
          testResults[testResults.length - 1] = { 
            test: 'Jobs Table Access', 
            status: 'success', 
            data: jobsTest 
          };
        }
        setResults([...testResults]);

        // Test 4: Try to insert a test job
        testResults.push({ test: 'Jobs Insert Test', status: 'starting' });
        setResults([...testResults]);

        // Get user's company first
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (companyError) {
          testResults[testResults.length - 1] = { 
            test: 'Jobs Insert Test', 
            status: 'failed', 
            error: `Company not found: ${companyError.message}` 
          };
        } else {
          const testJobData = {
            title: 'Test Job - DELETE ME',
            description: 'This is a test job',
            requirements: 'Test requirements',
            salary: 'Test salary',
            location: 'Ponta Grossa',
            contract_type: 'CLT' as const,
            work_mode: 'Presencial' as const,
            experience_level: 'Júnior' as const,
            company_id: company.id,
            status: 'Ativa' as const
          };

          const { data: insertTest, error: insertError } = await supabase
            .from('jobs')
            .insert([testJobData])
            .select()
            .single();

          if (insertError) {
            testResults[testResults.length - 1] = { 
              test: 'Jobs Insert Test', 
              status: 'failed', 
              error: insertError.message,
              details: insertError
            };
          } else {
            testResults[testResults.length - 1] = { 
              test: 'Jobs Insert Test', 
              status: 'success', 
              data: insertTest 
            };

            // Clean up - delete the test job
            await supabase.from('jobs').delete().eq('id', insertTest.id);
          }
        }
        setResults([...testResults]);
      }

    } catch (error: any) {
      console.error('Database test error:', error);
      testResults.push({
        test: 'Critical Error',
        status: 'failed',
        error: error.message
      });
      setResults([...testResults]);
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🔍 Database Connection Test</CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={testDatabaseConnection} 
          disabled={testing}
          className="mb-4"
        >
          {testing ? 'Testing...' : 'Run Database Tests'}
        </Button>

        <div className="space-y-2">
          {results.map((result, index) => (
            <div 
              key={index} 
              className={`p-3 rounded border ${
                result.status === 'success' ? 'bg-green-100 border-green-300' :
                result.status === 'failed' ? 'bg-red-100 border-red-300' :
                'bg-yellow-100 border-yellow-300'
              }`}
            >
              <div className="font-medium">
                {result.test}: 
                <span className={`ml-2 ${
                  result.status === 'success' ? 'text-green-600' :
                  result.status === 'failed' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {result.status}
                </span>
              </div>
              {result.error && (
                <div className="text-sm text-red-600 mt-1">
                  Error: {result.error}
                </div>
              )}
              {result.data && (
                <div className="text-sm text-gray-600 mt-1">
                  Data: {JSON.stringify(result.data, null, 2)}
                </div>
              )}
              {result.details && (
                <div className="text-xs text-gray-500 mt-1">
                  Details: {JSON.stringify(result.details, null, 2)}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseTestComponent;
