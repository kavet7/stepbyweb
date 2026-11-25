import bpy, math, random
from mathutils import Vector
from math import pi
b=bpy
b.ops.wm.read_factory_settings(use_empty=True)
s=b.context.scene
s.render.engine='CYCLES'
s.cycles.samples=40
s.cycles.use_denoising=False
s.render.threads_mode='FIXED'
s.render.threads=8
s.render.resolution_x=1272
s.render.resolution_y=1040
s.render.resolution_percentage=100
s.render.image_settings.file_format='PNG'
s.render.filepath='/tmp/step-hero.png'
s.world=b.data.worlds.new('Blue daylight')
s.world.use_nodes=True
s.world.node_tree.nodes['Background'].inputs[0].default_value=(.52,.63,1,1)
s.world.node_tree.nodes['Background'].inputs[1].default_value=.30
s.view_settings.view_transform='Standard'
s.view_settings.exposure=-0.35
def mat(name,color,rough=.65,metal=.0):
 m=b.data.materials.new(name);m.diffuse_color=(*color,1)
 m.use_nodes=True
 bs=m.node_tree.nodes.get('Principled BSDF')
 bs.inputs['Base Color'].default_value=(*color,1);bs.inputs['Roughness'].default_value=rough;bs.inputs['Metallic'].default_value=metal
 return m
floor=mat('Cobalt ground',(.015,.059,.57))
grid=mat('Construction grid',(.039,.12,.65))
white=mat('Measurement ink',(.16,.32,.83))
blue=mat('Ceramic cobalt',(.036,.128,.95),.38,.17)
blue2=mat('Blue risers',(.017,.064,.70),.45,.14)
lime=mat('Signal lime',(.67,1,.029),.49,.04)
def box(name,loc,dims,m,bevel=0):
 b.ops.mesh.primitive_cube_add(size=1,location=loc);obj=b.context.object;obj.name=name;obj.dimensions=dims
 b.ops.object.transform_apply(location=False,rotation=False,scale=True)
 obj.data.materials.append(m)
 if bevel:
  mod=obj.modifiers.new('Fine edge','BEVEL');mod.width=bevel;mod.segments=3
  mod=obj.modifiers.new('Normals','WEIGHTED_NORMAL')
 return obj
box('Ground',(0,0,-.15),(100,100,.25),floor)
def segment(x1,y1,x2,y2,width,z,m):
 dx=x2-x1;dy=y2-y1
 if dx==0 and dy==0:return
 obj=box('Drafting line',((x1+x2)*.5,(y1+y2)*.5,z),(math.hypot(dx,dy),width,.001),m)
 obj.rotation_euler.z=math.atan2(dy,dx)
for i in range(-17,18):
 v=i*.8
 for l in [(v,-14,v,14),(-14,v,14,v)]:
  segment(*l,.007,-.022,grid)
for i in range(66):
 a=-5+i*.16
 for p in [(a,-1.72,a+.078,-1.72), (a,2.0,a+.078,2.0)]:
  segment(*p,.013,-.017,white)
for i in range(49):
 y=-4+i*.16
 for x in [-3.29,3.31]:
  segment(x,y,x,y+.078,.013,-.016,white)
for x in [-3.29,3.31]:
 for y in [-1.72,2.0]:
  segment(x-.12,y-.12,x+.12,y+.12,.022,-.014,white)
  segment(x-.12,y+.12,x+.12,y-.12,.022,-.014,white)
# Cantilevered building blocks. Each layer steps back by a full tread.
for story in range(5):
 per=5-story;w=per*1.07
 box('Shadow reveal',(story*.535,0,story*.48+.021),(w-.13,2.62,.042),blue2,.008)
 box('Machined slab',(story*.535,0,story*.48+.254),(w,2.77,.445),blue,.022)
# Detached accent module at the top landing with a small shadow joint.
box('Setting joint',(2.17,.08,2.405),(.95,1.04,.028),blue2,.008)
box('Signal cube',(2.17,.08,2.955),(1.07,1.13,1.09),lime,.021)
def light(name,loc,energy,size,color,aim=(0,0,1)):
 d=b.data.lights.new(name,'AREA');d.energy=energy;d.shape='DISK';d.size=size;d.color=color
 o=b.data.objects.new(name,d);s.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector(aim)-o.location).to_track_quat('-Z','Y').to_euler()
light('Main softbox',(-4,-3,10),1250,5.5,(.92,.97,1))
light('Rim',(5.4,2,7),750,4.5,(.62,.75,1))
light('Studio fill',(-3,4,5),250,5,(.47,.62,1))
cam=b.data.cameras.new('Camera');obj=b.data.objects.new('Camera',cam);s.collection.objects.link(obj)
target=Vector((0,0,1.3));obj.location=target+Vector((-7.4,-10,6.7))
obj.rotation_euler=(target-obj.location).to_track_quat('-Z','Y').to_euler()
cam.type='ORTHO';cam.ortho_scale=8.40;s.camera=obj
b.ops.render.render(write_still=True)
