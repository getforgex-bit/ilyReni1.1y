import bpy, json, os, math
from mathutils import Vector
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = os.path.join(root, 'assets')
os.makedirs(out, exist_ok=True)
heart = bpy.data.objects['Corazon']
for o in list(bpy.data.objects):
    if o != heart: bpy.data.objects.remove(o, do_unlink=True)
bpy.context.view_layer.objects.active = heart
heart.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.join(out,'corazon.glb'), use_selection=True)
deps = bpy.context.evaluated_depsgraph_get()
mesh = heart.evaluated_get(deps).to_mesh()
mesh.calc_loop_triangles()
points = [heart.matrix_world @ v.co for v in mesh.vertices]
lo = Vector(tuple(min(v[i] for v in points) for i in range(3)))
hi = Vector(tuple(max(v[i] for v in points) for i in range(3)))
center = (lo + hi) / 2
scale = 2 / max(hi-lo)
pos, normals = [], []
for tri in mesh.loop_triangles:
    for idx in tri.vertices:
        v = (points[idx]-center)*scale
        pos.extend([v.x, v.z, -v.y])
        n = heart.matrix_world.to_3x3() @ tri.normal
        n.normalize()
        normals.extend([n.x,n.z,-n.y])
with open(os.path.join(out,'corazon.json'),'w') as f:
    json.dump({'positions':pos,'normals':normals,'source':'Corazon_morado.blend / Corazon'},f,separators=(',',':'))
print('Exported heart:',len(pos)//9,'triangles; bounds:',tuple(lo),tuple(hi))
camdata=bpy.data.cameras.new('Preview')
cam=bpy.data.objects.new('Preview',camdata)
bpy.context.collection.objects.link(cam)
cam.location=center+Vector((0,-6,0.25))
cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler()
camdata.type='ORTHO'; camdata.ortho_scale=2.9
bpy.context.scene.camera=cam
for name,loc,power,size in [('Key',(-3,-4,5),650,4),('Fill',(3,-2,1),400,3),('Rim',(1,2,3),800,3)]:
    data=bpy.data.lights.new(name,'AREA'); data.energy=power; data.shape='DISK'; data.size=size
    obj=bpy.data.objects.new(name,data); bpy.context.collection.objects.link(obj)
    obj.location=center+Vector(loc); obj.rotation_euler=(center-obj.location).to_track_quat('-Z','Y').to_euler()
scene=bpy.context.scene
scene.render.engine='CYCLES'; scene.cycles.samples=24
scene.render.resolution_x=768; scene.render.resolution_y=768; scene.render.resolution_percentage=100
scene.render.film_transparent=True
scene.render.image_settings.file_format='PNG'
scene.render.filepath=os.path.join(out,'corazon.png')
bpy.ops.render.render(write_still=True)
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from clean_render_metadata import clean_png
clean_png(os.path.join(out,'corazon.png'))
