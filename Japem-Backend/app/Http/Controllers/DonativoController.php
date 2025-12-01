<?php
    namespace App\Http\Controllers;

    use App\Models\Donativo;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\DB;

    class DonativoController extends Controller
    {
        public function index()
        {
            // Traemos los donativos CON sus necesidades y catalogo
            return Donativo::with(['necesidad', 'catalogo'])->orderBy('id', 'asc')->get();
        }

        public function show($id)
        {
            $donativo = Donativo::with(['necesidad', 'catalogo'])->find($id);

            if (!$donativo) {
                return response()->json(['error' => 'Donativo no encontrado'], 404);
            }

            return response()->json($donativo);
        }

        public function store(Request $request)
        {
            // Validamos todo junto
            $request->validate([
                'id_japem' => 'required|string|max:255|unique:donativos,id_japem',
                'nombre' => 'required|string|max:255',
                'necesidad_pri' => 'nullable|string', // Validamos aunque no esté en la tabla principal
                'necesidad_sec' => 'nullable|string',
                'necesidad_com' => 'nullable|string',
                // ... resto de validaciones ...
            ]);

            return DB::transaction(function () use ($request) {
                // 1. Preparamos datos del Donativo (quitando lo que no es suyo)
                $donativoData = $request->except(['necesidad_pri', 'necesidad_sec', 'necesidad_com']);
                
                // Conversión de booleanos
                $donativoData['certificacion'] = in_array(strtolower($request->certificacion), ['si', 'true', '1']);
                $donativoData['candidato'] = in_array(strtolower($request->candidato), ['si', 'true', '1']);
                $donativoData['donataria_aut'] = in_array(strtolower($request->donataria_aut), ['si', 'true', '1']);
                $donativoData['padron_ben'] = in_array(strtolower($request->padron_ben), ['si', 'true', '1']);

                // 2. Creamos el Donativo
                $donativo = Donativo::create($donativoData);

                // 3. Creamos las Necesidades vinculadas
                $donativo->necesidad()->create([
                    'necesidad_pri' => $request->necesidad_pri,
                    'necesidad_sec' => $request->necesidad_sec,
                    'necesidad_com' => $request->necesidad_com,
                ]);

                return response()->json([
                    'message' => 'Donativo creado correctamente',
                    'data' => $donativo->load('necesidad')
                ], 201);
            });
        }

        public function update(Request $request, $id)
        {
            $donativo = Donativo::find($id);

            if (!$donativo) {
                return response()->json(['message' => 'Donativo no encontrado'], 404);
            }

            return DB::transaction(function () use ($request, $donativo) {
                // 1. Actualizar Donativo
                $donativoData = $request->except(['necesidad_pri', 'necesidad_sec', 'necesidad_com']);
                
                // Conversiones de booleanos si vienen en el request...
                if($request->has('certificacion')) 
                    $donativoData['certificacion'] = in_array(strtolower($request->certificacion), ['si', 'true', '1']);
                // ... (repetir para otros booleanos)

                $donativo->update($donativoData);

                // 2. Actualizar o Crear Necesidades
                // updateOrCreate busca por el ID del donativo y actualiza los valores
                $donativo->necesidad()->updateOrCreate(
                    ['id_donativos' => $donativo->id],
                    [
                        'necesidad_pri' => $request->necesidad_pri,
                        'necesidad_sec' => $request->necesidad_sec,
                        'necesidad_com' => $request->necesidad_com,
                    ]
                );

                return response()->json([
                    'message' => 'Donativo actualizado correctamente',
                    'data' => $donativo->load('necesidad')
                ]);
            });
        }
    }