'use client';
import { Field, Form, Formik, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { ChevronDownIcon } from '@heroicons/react/16/solid';
import axios from 'axios';
import cn from 'classnames';
import { useState } from 'react';

const toCurrency = (
  amount: number | string,
  currency = 'MXN',
  locale = 'es-MX'
) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(Number(amount));
};

const FORM_FIELDS: Array<
  | {
      name: string;
      placeholder?: string | number;
      label: string;
      type: 'text';
    }
  | {
      name: string;
      label: string;
      type: 'select';
      options: Array<{ copy: string; value: string }>;
    }
> = [
  {
    name: 'surface_total_in_m2',
    placeholder: 300,
    label: 'Surface total (m2)',
    type: 'text',
  },
  {
    name: 'surface_covered_in_m2',
    placeholder: 250,
    label: 'Covered surface (m2)',
    type: 'text',
  },
  { name: 'lat', placeholder: '20.5976758', label: 'Latitude', type: 'text' },
  {
    name: 'lon',
    placeholder: '-100.3432712',
    label: 'Longitude',
    type: 'text',
  },
  {
    name: 'property_type',
    label: 'Type',
    type: 'select',
    options: [
      { value: '', copy: '-- Select a type --' },
      { value: 'apartment', copy: 'Apartment' },
      { value: 'house', copy: 'House' },
      { value: 'store', copy: 'Store' },
      { value: 'PH', copy: 'PentHouse' },
    ],
  },
  { name: 'estado', label: 'Estado', type: 'text' },
  { name: 'municipio', label: 'Municipio', type: 'text' },
  { name: 'localidad', label: 'Localidad', type: 'text' },
];

const validationSchema = Yup.object({
  surface_total_in_m2: Yup.number()
    .typeError('Must be a number')
    .required('Required'),
  surface_covered_in_m2: Yup.number()
    .typeError('Must be a number')
    .required('Required'),
  lat: Yup.number().typeError('Must be a number').required('Required'),
  lon: Yup.number().typeError('Must be a number').required('Required'),
  property_type: Yup.string().required('Required'),
  estado: Yup.string().required('Required'),
  municipio: Yup.string().required('Required'),
  localidad: Yup.string().required('Required'),
});

const EstimatePage = () => {
  const [response, setResponse] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="space-y-12">
          <div className="border border-gray-900/10 p-12 rounded-2xl">
            <h2 className="text-base/7 font-semibold text-gray-900">
              Property Valuation
            </h2>
            <Formik
              initialValues={{
                surface_total_in_m2: '',
                surface_covered_in_m2: '',
                lat: '',
                lon: '',
                property_type: '',
                estado: '',
                municipio: '',
                localidad: '',
              }}
              validationSchema={validationSchema}
              onSubmit={async (values, { resetForm }) => {
                setResponse(null);
                try {
                  const response = await axios.post(
                    'https://admon-software.onrender.com/predict',
                    values
                  );

                  setResponse({
                    type: response.status === 200 ? 'success' : 'error',
                    message:
                      `The value is estimated at: ${toCurrency(
                        response.data.prediction
                      )}` || 'Something went wrong. Please try again.',
                  });
                  resetForm();
                } catch (error) {
                  console.error(error);
                  setResponse({
                    type: 'error',
                    message: 'Something went wrong. Please try again.',
                  });
                }
              }}
            >
              {({ isSubmitting, touched, errors }) => (
                <Form>
                  <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    {FORM_FIELDS.map((field) => {
                      const fieldProps = (() => {
                        const common = { id: field.name, name: field.name };
                        switch (field.type) {
                          case 'select':
                            return {
                              ...common,
                              as: 'select',
                              children: field.options.map((option) => (
                                <option
                                  key={option.value}
                                  value={option.value}
                                  disabled={!option.value}
                                >
                                  {option.copy}
                                </option>
                              )),
                            };
                          case 'text':
                          default:
                            return {
                              ...common,
                              placeholder: field.placeholder || '',
                            };
                        }
                      })();

                      return (
                        <div key={field.name} className="sm:col-span-3">
                          <label
                            htmlFor={field.name}
                            className="block text-sm/6 font-medium text-gray-900"
                          >
                            {field.label}
                          </label>
                          <div
                            className={cn('mt-2', {
                              'grid grid-cols-1': field.type === 'select',
                            })}
                          >
                            <Field
                              {...fieldProps}
                              className={cn(
                                'w-full',
                                'rounded-md',
                                'bg-white',
                                'py-1.5',
                                'text-base',
                                'text-gray-900',
                                'outline-1',
                                '-outline-offset-1',
                                'sm:text-sm/6',
                                'focus:outline-2',
                                'focus:-outline-offset-2',
                                field.type === 'text'
                                  ? [
                                      'block',
                                      'px-3',
                                      'placeholder:text-gray-400',
                                    ]
                                  : [
                                      'col-start-1',
                                      'row-start-1',
                                      'appearance-none',
                                      'pr-8',
                                      'pl-3',
                                    ],
                                touched[field.name as keyof typeof touched] &&
                                  errors[field.name as keyof typeof touched]
                                  ? ['outline-red-500', 'focus:outline-red-500']
                                  : [
                                      'outline-gray-300',
                                      'focus:outline-indigo-600',
                                    ]
                              )}
                            />
                            {field.type === 'select' && (
                              <ChevronDownIcon
                                aria-hidden="true"
                                className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                              />
                            )}
                            <ErrorMessage
                              name={field.name}
                              component="div"
                              className="mt-1 text-sm text-red-600"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-6 flex items-center justify-end gap-x-6">
                    <button
                      type="submit"
                      className={cn(
                        'rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
                        { 'opacity-50 cursor-not-allowed': isSubmitting }
                      )}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Calculating...' : 'Submit'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
            {response && (
              <div
                className={cn(
                  'mt-4',
                  'p-3',
                  'rounded',
                  'text-sm',
                  'border',
                  response.type === 'success'
                    ? ['bg-green-100', 'text-green-800', 'border-green-300']
                    : ['bg-red-100', 'text-red-800', 'border-red-300']
                )}
              >
                {response.message}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EstimatePage;
