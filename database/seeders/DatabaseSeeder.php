<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Project;
use App\Models\Article;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $descriptions = [
            'Electronic Component A', 'Steel Pipe 50mm', 'Plastic Container 20L',
            'LED Panel 24W', 'Hydraulic Valve Type B', 'Copper Wire 2.5mm',
            'Rubber Seal Ring', 'Aluminum Sheet 3mm', 'Control Module X200',
            'Sensor Proximity PNP', 'Motor AC 3HP', 'Conveyor Belt 5m',
            'Gearbox Reducer 1:50', 'Pneumatic Cylinder 100mm', 'PLC Controller S7-1200',
            'HMI Touch Panel 7"', 'Cable Tray 3m', 'Junction Box IP65',
            'Fuse Holder 32A', 'Relay 24VDC 8A', 'Transformer 220/24V',
            'Switch Disconnect 63A', 'Push Button Green', 'Emergency Stop Red',
            'Limit Switch Roller', 'Encoder Rotary 1024', 'Servo Motor 750W',
            'Inverter Drive 5.5kW', 'Power Supply 24V 10A', 'Terminal Block 4mm',
            'DIN Rail 2m', 'Cable Gland M20', 'Fan Filter 120mm',
            'Heater Cabinet 200W', 'Thermostat 0-60C', 'Pressure Switch 10bar',
            'Flow Meter 50L/min', 'Level Sensor Float', 'Temperature Probe PT100',
            'Solenoid Valve 2/2', 'Check Valve Spring', 'Ball Valve DN25',
            'Gate Valve PN16', 'Strainer Y-Type', 'Manometer 0-10bar',
            'Thermometer Bimetal', 'Counter Digital 6digit', 'Timer Relay 0-99s',
            'Contactor 3P 32A', 'Overload Relay 25A', 'Isolator 3P 63A',
            'MCB 1P 16A', 'RCD 2P 30mA', 'Distribution Block 1P',
            'Cable Tie 200mm', 'Heat Shrink 20mm', 'Insulation Tape PVC',
            'Label Printer Tape', 'Marker Pen Permanent', 'Tool Set Electrician',
            'Screwdriver Set 7pcs', 'Pliers Combination', 'Wire Stripper Auto',
            'Crimping Tool 0.5-6mm', 'Multimeter Digital', 'Clamp Meter 600A',
            'Insulation Tester 500V', 'Phase Sequence Indicator', 'Socket Tester 230V',
            'Voltage Detector Pen', 'Cable Reel 50m', 'Extension Lead 10m',
            'Work Light LED 20W', 'Head Lamp LED', 'Safety Glasses Clear',
            'Ear Plug Foam', 'Gloves Cut Resistant', 'Helmet White',
            'Safety Shoes S3', 'Vest Reflective', 'Harness Fall Arrest',
            'Barrier Tape Red', 'Sign Warning 240V', 'Lockout Kit Electrical',
            'Padlock Keyed Alike', 'Tag Danger', 'Hasp Lockout',
            'Breaker Lockout Small', 'Valve Lockout Gate', 'Cable Lockout 2.4m',
            'Group Lock Box', 'Scaffold Tag Green', 'Lanyard Shock Absorb',
            'Carabiner Triple', 'Anchor Point D-ring', 'Net Debris 3x6m',
            'Spill Kit Oil', 'Absorbent Pad 40cm', 'Sock Boom 3m',
            'Drum Overpack 95gal', 'Container UN 200L', 'Pallet Drum 4-way',
        ];

        $units = ['PCS', 'BOX', 'KG', 'M', 'L', 'SET', 'ROLL', 'PAIR', 'PACK', 'BAG'];
        $types = ['Stock In', 'Receiving', 'Inventory', 'Production', 'Distribution', 'Export', 'Import'];
        $statuses = ['active', 'archived'];

        // 100 Projects
        $projectData = [];
        for ($i = 1; $i <= 100; $i++) {
            $projectData[] = [
                'name' => 'Project ' . str_pad($i, 3, '0', STR_PAD_LEFT) . ' - ' . fake()->company(),
                'type' => $types[array_rand($types)],
                'status' => $statuses[array_rand($statuses)],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        Project::insert($projectData);

        // 100 Articles per Project = 10,000 total
        $projects = Project::all();
        foreach ($projects as $project) {
            $articleData = [];
            for ($j = 1; $j <= 100; $j++) {
                $articleData[] = [
                    'project_id' => $project->id,
                    'art' => 'ART-' . str_pad($j, 5, '0', STR_PAD_LEFT),
                    'ref' => 'REF-' . rand(1000000, 9999999),
                    'des' => $descriptions[array_rand($descriptions)],
                    'total' => rand(10, 9999),
                    'unit' => $units[array_rand($units)],
                    'emp_m' => rand(0, 9),
                    'emp_cm' => rand(0, 99),
                    'emp_max' => rand(50, 200),
                    'addr_r' => rand(1, 20),
                    'addr_c' => rand(1, 50),
                    'palet' => rand(1, 10),
                    'qte_palet' => rand(50, 500),
                    'cart' => rand(5, 50),
                    'qte_cart' => rand(10, 200),
                    'sag' => rand(1, 20),
                    'qte_sag' => rand(5, 50),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                // Insert kol 50 bach ma ykhlas l-memory
                if ($j % 50 === 0) {
                    Article::insert($articleData);
                    $articleData = [];
                }
            }
            if (!empty($articleData)) {
                Article::insert($articleData);
            }
        }
    }
}
