'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { trpc } from '@/app/_trpc/client';
import { toast } from 'react-hot-toast';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface State {
  nome: string;
  sigla: string;
}

interface City {
  id_municipio: number;
  uf: string;
  municipio: string;
  longitude: number;
  latitude: number;
}

interface MunData {
  estados: State[];
  cidades: City[];
}

const formSchema = z.object({
  // Step 1: Informações básicas
  title: z.string().min(3, 'Nome da empresa deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  
  // Step 2: Endereço
  street: z.string().min(3, 'Endereço deve ter no mínimo 3 caracteres'),
  neighborhood: z.string().min(3, 'Bairro deve ter no mínimo 3 caracteres'),
  city: z.string().min(3, 'Cidade é obrigatória'),
  state: z.string().length(2, 'Estado é obrigatório'),
  cep: z.string().length(8, 'CEP inválido'),
  complement: z.string().optional(),
});

interface StoreRegistrationFormProps {
  onSuccess?: () => void;
}

export function StoreRegistrationForm({ onSuccess }: StoreRegistrationFormProps) {
  const [step, setStep] = useState(1);
  const [munData, setMunData] = useState<MunData | null>(null);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedState, setSelectedState] = useState('');
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const createStore = trpc.stores.create.useMutation({
    onSuccess: () => {
      toast.success('Empresa registrada com sucesso!');
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      email: '',
      phone: '',
      street: '',
      neighborhood: '',
      city: '',
      state: '',
      cep: '',
      complement: '',
    },
  });

  // Carregar dados do mun.json apenas uma vez
  useEffect(() => {
    const loadMunData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/data/mun.json');
        const data: MunData = await response.json();
        setMunData(data);
        setStates(data.estados);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar estados e cidades');
      } finally {
        setIsLoading(false);
      }
    };

    loadMunData();
  }, []);

  // Atualizar cidades quando o estado for selecionado
  useEffect(() => {
    if (selectedState && munData) {
      const citiesOfState = munData.cidades.filter(
        city => city.uf === selectedState
      );
      setCities(citiesOfState);
    } else {
      setCities([]);
    }
  }, [selectedState, munData]);

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    form.setValue('state', value);
    form.setValue('city', '');
  };

  const handleCityChange = (value: string) => {
    form.setValue('city', value);
    const selectedCity = cities.find(city => city.municipio === value);
    if (selectedCity) {
      setLocation({
        latitude: selectedCity.latitude,
        longitude: selectedCity.longitude,
      });
    }
  };

  const handleNext = async () => {
    const step1Fields = ['title', 'email', 'phone'];
    const isStep1Valid = await form.trigger(step1Fields as any);
    
    if (isStep1Valid) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    createStore.mutate({
      ...data,
      address: {
        ...data,
        ...location,
      },
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">
          {step === 1 ? 'Registre sua Empresa' : 'Endereço da Empresa'}
        </CardTitle>
        <CardDescription className="text-center">
          {step === 1 
            ? 'Preencha as informações básicas da sua empresa'
            : 'Informe o endereço da sua empresa'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {step === 1 ? (
              // Step 1: Informações básicas
              <>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Empresa</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Digite o nome da sua empresa" 
                          {...field} 
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="email@empresa.com" 
                          {...field} 
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="(00) 00000-0000" 
                          {...field} 
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  className="w-full"
                  onClick={handleNext}
                  disabled={isLoading}
                >
                  Próximo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            ) : (
              // Step 2: Endereço
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cep"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="00000-000" 
                            {...field} 
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select
                          disabled={isLoading}
                          onValueChange={handleStateChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="UF" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {states.map((state) => (
                              <SelectItem key={state.sigla} value={state.sigla}>
                                {state.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <Select
                        disabled={!selectedState || isLoading}
                        onValueChange={handleCityChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma cidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city.id_municipio} value={city.municipio}>
                              {city.municipio}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Rua, número" 
                          {...field} 
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="neighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Bairro" 
                          {...field} 
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="complement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Complemento (opcional)" 
                          {...field} 
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleBack}
                    disabled={isLoading}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                  </Button>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading || createStore.isLoading}
                  >
                    {createStore.isLoading ? 'Registrando...' : 'Registrar Empresa'}
                  </Button>
                </div>
              </>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 