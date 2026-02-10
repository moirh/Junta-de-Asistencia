<?php

namespace App\Http\Controllers;

use App\Models\Iap;
use Illuminate\Http\Request;

class IapController extends Controller
{
    public function index()
    {
        return Iap::orderBy('nombre_iap', 'asc')->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre_iap' => 'required|string|max:255',
            'rubro' => 'nullable|string',
        ]);

        $iap = Iap::create($request->all());
        return response()->json($iap, 201);
    }

    public function show($id)
    {
        return Iap::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $iap = Iap::findOrFail($id);
        $iap->update($request->all());
        return response()->json($iap);
    }

    public function destroy($id)
    {
        $iap = Iap::findOrFail($id);
        $iap->delete();
        return response()->json(['message' => 'Eliminado correctamente']);
    }

    // --- ESTA ES LA FUNCIÓN QUE TE FALTABA ---
    public function sugerirIaps(Request $request)
    {
        // 1. Recibimos qué producto queremos donar
        $producto = $request->query('producto');

        if (!$producto) {
            return response()->json([]);
        }

        // 2. Buscamos IAPs activas que necesiten ese producto
        // Usamos 'ILIKE' porque estás en PostgreSQL (ignora mayúsculas)
        $candidatos = Iap::where('estatus', 'Activa')
            ->where(function ($query) use ($producto) {
                $query->Where('necesidad_complementaria', 'ILIKE', "%$producto%")
                    ->orWhere('rubro', 'ILIKE', "%$producto%");
            })
            // 3. Reglas de Prioridad
            ->orderBy('es_certificada', 'desc')
            ->orderBy('tiene_donataria_autorizada', 'desc')
            ->orderBy('veces_donado', 'asc')
            ->take(5)
            ->get();

        return response()->json($candidatos);
    }
    // Asegúrate de importar esto arriba: use Illuminate\Support\Facades\Log;

    public function importar(Request $request)
    {
        $request->validate(['archivo' => 'required|file|mimes:csv,txt']);

        try {
            $file = $request->file('archivo');
            // Abrimos el archivo
            $data = array_map('str_getcsv', file($file->getRealPath()));

            // Quitamos la primera fila (los encabezados: Nombre, Estatus, etc.)
            $header = array_shift($data);
            $count = 0;

            foreach ($data as $row) {
                // Validamos que la fila tenga datos (evitar filas vacías al final)
                if (count($row) < 3) continue;

                /* MAPEO DE COLUMNAS SEGÚN TU IMAGEN:
                   0: Nombre, 1: Estatus, 2: Rubro, 3: Clasif, 4: Actividad, 
                   5: Beneficiario (Texto), 6: Población (Num), 7: Nec. Extra, 
                   8: Cert, 9: Donat, 10: Padrón
                */

                \App\Models\Iap::create([
                    'nombre_iap' => utf8_encode($row[0]),
                    'estatus'    => $row[1] ?? 'Activa',
                    'rubro'      => $row[2] ?? 'Salud',
                    'clasificacion'         => $row[3] ?? '',
                    'actividad_asistencial' => $row[4] ?? '',
                    'tipo_beneficiario'     => $row[5] ?? '', // Ej: "Fijos: 10"
                    'personas_beneficiadas' => is_numeric($row[6]) ? $row[6] : 0,
                    'necesidad_complementaria' => $row[7] ?? '',
                    // Convertimos el "1" o "0" del Excel a booleano real
                    'es_certificada'             => ($row[8] ?? 0) == '1',
                    'tiene_donataria_autorizada' => ($row[9] ?? 0) == '1',
                    'tiene_padron_beneficiarios' => ($row[10] ?? 0) == '1',
                    'veces_donado' => 0
                ]);
                $count++;
            }

            return response()->json(['message' => "Se importaron $count instituciones exitosamente."]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al importar: ' . $e->getMessage()], 500);
        }
    }
}
