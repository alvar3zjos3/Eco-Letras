"""
Script para poblar la base de datos con datos de ejemplo - Eco Iglesia Letras
Actualizado: 16 de julio, 2025

Este script crea:
- Usuario administrador
- Artistas de ejemplo
- Canciones con letras en español
- Usuarios adicionales
- Favoritos y actividades
- Datos realistas para testing y desarrollo

Uso:
    python seed_data.py           # Crear datos de ejemplo
    python seed_data.py --reset   # Resetear y recrear toda la BD
"""
import sys
import os
import json
from typing import Dict, List, Any, cast

# Agregar directorio raíz al path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.core.database import SessionLocal, engine
from app.core.security import get_password_hash
from app.models.user import User
from app.models.artist import Artist
from app.models.song import Song
from app.models.favorite_songs import FavoriteSong
from app.models.activity import Activity

# Configurar logging
import logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def create_tables():
    """Crear todas las tablas si no existen"""
    try:
        # Crear tablas usando el metadata de Base
        User.metadata.create_all(bind=engine)
        logger.info("✅ Tablas creadas/verificadas correctamente")
    except Exception as e:
        logger.error(f"❌ Error creando tablas: {e}")
        raise


def create_admin_user(db: Session) -> User:
    """Crear usuario administrador si no existe"""
    try:
        existing_admin = db.query(User).filter_by(username="admin").first()
        if existing_admin:
            logger.info("ℹ️ Usuario admin ya existe")
            return existing_admin
        
        admin_user = User(
            email="admin@ecoiglesialetras.es",
            username="admin",
            full_name="Administrador Eco Iglesia",
            hashed_password=get_password_hash("EcoAdmin2025!"),
            is_active=True,
            is_admin=True,
            is_verified=True,
            is_premium=True,
            role="admin",
            status="active",
            avatar_url="https://i.ibb.co/tM90CMrj/Sin-t-tulo.png",
            musical_tastes="Adoración, Worship, Pop Cristiano, Rock Cristiano",
            favorite_artists="Hillsong United, Bethel Music, Jesus Culture, Elevation Worship",
            social_links=json.dumps({
                "instagram": "@ecoiglesiaES",
                "twitter": "@ecoiglesiaES",
                "facebook": "https://facebook.com/ecoiglesiaES",
                "youtube": "https://youtube.com/@ecoiglesiaES"
            }),        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        logger.info("✅ Usuario admin creado exitosamente")
        return admin_user
        
    except IntegrityError as e:
        db.rollback()
        logger.warning(f"⚠️ El usuario admin ya existe: {e}")
        return db.query(User).filter_by(username="admin").first()
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error creando usuario admin: {e}")
        raise


def create_sample_artists(db: Session) -> Dict[str, int]:
    """Crear artistas de ejemplo con datos completos"""
    artists_data: List[Dict[str, Any]] = [
        {
            "name": "Hillsong United",
            "slug": "hillsong-united",
            "biography": "Banda de música cristiana contemporánea originaria de Australia, parte de Hillsong Church. Conocidos mundialmente por sus canciones de adoración.",
            "facebook_url": "https://facebook.com/hillsongunited",
            "instagram_url": "https://instagram.com/hillsongunited",
            "website_url": "https://hillsong.com/united",
            "verified": True
        },
        {
            "name": "Jesus Culture",
            "slug": "jesus-culture",
            "biography": "Ministerio de música cristiana fundado en California, Estados Unidos. Reconocidos por su pasión en la adoración y formación de jóvenes adoradores.",
            "facebook_url": "https://facebook.com/jesusculture",
            "instagram_url": "https://instagram.com/jesusculture",
            "website_url": "https://jesusculture.com",
            "verified": True
        },
        {
            "name": "Bethel Music",
            "slug": "bethel-music",
            "biography": "Colectivo de música cristiana de Redding, California. Conocidos por su estilo profético y canciones de adoración espontánea.",
            "facebook_url": "https://facebook.com/bethelmusic",
            "instagram_url": "https://instagram.com/bethelmusic",
            "website_url": "https://bethelmusic.com",
            "verified": True
        },
        {
            "name": "Elevation Worship",
            "slug": "elevation-worship",
            "biography": "Banda de adoración de Elevation Church en Charlotte, Carolina del Norte. Reconocidos por sus producciones musicales de alta calidad.",
            "facebook_url": "https://facebook.com/elevationworship",
            "instagram_url": "https://instagram.com/elevationworship",
            "website_url": "https://elevationworship.com",
            "verified": True
        },
        {
            "name": "Marcos Witt",
            "slug": "marcos-witt",
            "biography": "Cantante, pastor y compositor cristiano mexicano-estadounidense. Pionero de la música cristiana contemporánea en español.",
            "facebook_url": "https://facebook.com/marcoswittoficial",
            "instagram_url": "https://instagram.com/marcoswitt",
            "website_url": "https://marcoswitt.com",
            "verified": True
        },
        {
            "name": "Rojo",
            "slug": "rojo",
            "biography": "Banda de rock cristiano originaria de México, reconocida por su estilo energético y letras poderosas de fe.",
            "facebook_url": "https://facebook.com/rojooficial",
            "instagram_url": "https://instagram.com/rojooficial",
            "website_url": "https://rojo.com",
            "verified": True
        },
        {
            "name": "Redimi2",
            "slug": "redimi2",
            "biography": "Rapero cristiano dominicano, pionero del rap cristiano en español. Conocido por sus letras evangelísticas y testimoniales.",
            "facebook_url": "https://facebook.com/redimi2oficial",
            "instagram_url": "https://instagram.com/redimi2",
            "website_url": "https://redimi2.com",
            "verified": True
        },
        {
            "name": "Evan Craft",
            "slug": "evan-craft",
            "biography": "Cantante y compositor cristiano bilingüe, conocido por sus colaboraciones y versiones en español de canciones populares.",
            "facebook_url": "https://facebook.com/evancraftmusic",
            "instagram_url": "https://instagram.com/evancraft",
            "website_url": "https://evancraft.com",
            "verified": True
        }
    ]
    
    artist_ids: Dict[str, int] = {}
    
    for artist_data in artists_data:
        try:
            existing = db.query(Artist).filter_by(slug=artist_data["slug"]).first()
            if existing:
                artist_ids[artist_data["name"]] = cast(int, existing.id)
                logger.info(f"ℹ️ Artista '{artist_data['name']}' ya existe")
            else:
                artist = Artist(**artist_data)
                db.add(artist)
                db.flush()  # Para obtener el ID
                artist_ids[artist_data["name"]] = cast(int, artist.id)
                logger.info(f"✅ Artista '{artist_data['name']}' creado")
                
        except IntegrityError as e:
            db.rollback()
            logger.warning(f"⚠️ Error de integridad para artista '{artist_data['name']}': {e}")
            existing = db.query(Artist).filter_by(name=artist_data["name"]).first()
            if existing:
                artist_ids[artist_data["name"]] = cast(int, existing.id)
        except Exception as e:
            logger.error(f"❌ Error creando artista '{artist_data['name']}': {e}")
    
    db.commit()
    return artist_ids


def create_sample_songs(db: Session, artist_ids: Dict[str, int]) -> None:
    """Crear canciones de ejemplo con letras completas en español"""
    songs_data: List[Dict[str, Any]] = [
        {
            "title": "Oceans (Where Feet May Fail)",
            "slug": "oceans-where-feet-may-fail",
            "lyrics": (
                "Tú me llamas sobre las aguas\n"
                "El gran desconocido donde pies pueden fallar\n"
                "Y allí te encuentro en el misterio\n"
                "En océanos profundos, mi fe permanecerá.\n\n"
                "Y te llamaré por tu nombre\n"
                "Y mantendré mis ojos sobre las olas\n"
                "Cuando los océanos se eleven\n"
                "Mi alma descansará en tu abrazo\n"
                "Porque soy tuyo y tú eres mío.\n\n"
                "Tu gracia abunda en las profundidades\n"
                "Tu mano soberana será mi guía\n"
                "Donde pies pueden fallar y el temor me rodea\n"
                "Tú nunca fallas y no empiezas a tambalearte."
            ),
            "sections": [
                {
                    "type": "verso",
                    "text": "Tú me llamas sobre las aguas\nEl gran desconocido donde pies pueden fallar\nY allí te encuentro en el misterio\nEn océanos profundos, mi fe permanecerá."
                },
                {
                    "type": "coro",
                    "text": "Y te llamaré por tu nombre\nY mantendré mis ojos sobre las olas\nCuando los océanos se eleven\nMi alma descansará en tu abrazo\nPorque soy tuyo y tú eres mío."
                },
                {
                    "type": "puente",
                    "text": "Tu gracia abunda en las profundidades\nTu mano soberana será mi guía\nDonde pies pueden fallar y el temor me rodea\nTú nunca fallas y no empiezas a tambalearte."
                }
            ],
            "key_signature": "C",
            "tempo": "74 BPM",
            "genre": "Adoración",
            "youtube_url": "https://www.youtube.com/watch?v=dy9nwe9_xzw",
            "views": 0,
            "artist_id": artist_ids.get("Hillsong United")
        },
        {
            "title": "How He Loves",
            "slug": "how-he-loves",
            "lyrics": (
                "Él es celoso por mí\n"
                "Me ama como un huracán, soy un árbol\n"
                "Doblándome bajo el peso de su viento y misericordia\n"
                "Cuando de repente me doy cuenta de que estoy en el ojo de la tormenta\n\n"
                "Y estoy a salvo aquí en tu amor\n"
                "Envuelto en los brazos del fuego de los cielos\n"
                "Si una lluvia de gracia cae sobre nosotros\n"
                "Y estoy a salvo aquí en tu amor."
            ),
            "sections": [
                {
                    "type": "verso",
                    "text": "Él es celoso por mí\nMe ama como un huracán, soy un árbol\nDoblándome bajo el peso de su viento y misericordia\nCuando de repente me doy cuenta de que estoy en el ojo de la tormenta"
                },
                {
                    "type": "coro",
                    "text": "Y estoy a salvo aquí en tu amor\nEnvuelto en los brazos del fuego de los cielos\nSi una lluvia de gracia cae sobre nosotros\nY estoy a salvo aquí en tu amor."
                }
            ],
            "key_signature": "G",
            "tempo": "76 BPM",
            "genre": "Adoración",
            "youtube_url": "https://www.youtube.com/watch?v=EqK5WJ-2PKc",
            "views": 0,
            "artist_id": artist_ids.get("Jesus Culture")
        },
        {
            "title": "Goodness of God",
            "slug": "goodness-of-god",
            "lyrics": (
                "Te amo Señor\n"
                "Oh tu gracia nunca falla\n"
                "Cada día estoy en tus manos\n"
                "Desde el momento en que me despierto\n"
                "Hasta que pongo mi cabeza para descansar\n\n"
                "Cantaré de la bondad de Dios\n"
                "Todos mis días has sido tan, tan bueno\n"
                "Todos mis días has sido tan, tan bueno\n"
                "Con cada respiración que tengo\n"
                "Cantaré de la bondad de Dios."
            ),
            "sections": [
                {
                    "type": "verso",
                    "text": "Te amo Señor\nOh tu gracia nunca falla\nCada día estoy en tus manos\nDesde el momento en que me despierto\nHasta que pongo mi cabeza para descansar"
                },
                {
                    "type": "coro",
                    "text": "Cantaré de la bondad de Dios\nTodos mis días has sido tan, tan bueno\nTodos mis días has sido tan, tan bueno\nCon cada respiración que tengo\nCantaré de la bondad de Dios."
                }
            ],
            "key_signature": "C",
            "tempo": "72 BPM",
            "genre": "Adoración",
            "youtube_url": "https://www.youtube.com/watch?v=kJ_7X0mn9vY",
            "views": 0,
            "artist_id": artist_ids.get("Bethel Music")
        },
        {
            "title": "Graves Into Gardens",
            "slug": "graves-into-gardens",
            "lyrics": (
                "Busco resurrección en mi vida\n"
                "Busco que lo que estaba muerto vuelva a la vida\n"
                "Dios, Tú tienes la reputación de hacer milagros\n"
                "Así que haz lo que solo Tú puedes hacer\n\n"
                "Tú conviertes tumbas en jardines\n"
                "Tú conviertes huesos en ejércitos\n"
                "Tú conviertes mares en tierra seca\n"
                "Tú eres el único que puede."
            ),
            "sections": [
                {
                    "type": "verso",
                    "text": "Busco resurrección en mi vida\nBusco que lo que estaba muerto vuelva a la vida\nDios, Tú tienes la reputación de hacer milagros\nAsí que haz lo que solo Tú puedes hacer"
                },
                {
                    "type": "coro",
                    "text": "Tú conviertes tumbas en jardines\nTú conviertes huesos en ejércitos\nTú conviertes mares en tierra seca\nTú eres el único que puede."
                }
            ],
            "key_signature": "G",
            "tempo": "70 BPM",
            "genre": "Adoración",
            "youtube_url": "https://www.youtube.com/watch?v=R4JZyOb_7ik",
            "views": 0,
            "artist_id": artist_ids.get("Elevation Worship")
        },
        {
            "title": "Renuévame",
            "slug": "renuevame",
            "lyrics": (
                "Renuévame Señor Jesús\n"
                "Ya no quiero ser igual\n"
                "Renuévame Señor Jesús\n"
                "Pon en mí tu corazón\n\n"
                "Porque todo lo que hay dentro de mí\n"
                "Necesita ser cambiado Señor\n"
                "Porque todo lo que hay dentro de mí\n"
                "Necesita más de ti."
            ),
            "sections": [
                {
                    "type": "coro",
                    "text": "Renuévame Señor Jesús\nYa no quiero ser igual\nRenuévame Señor Jesús\nPon en mí tu corazón"
                },
                {
                    "type": "verso",
                    "text": "Porque todo lo que hay dentro de mí\nNecesita ser cambiado Señor\nPorque todo lo que hay dentro de mí\nNecesita más de ti."
                }
            ],
            "key_signature": "D",
            "tempo": "75 BPM",
            "genre": "Adoración",
            "youtube_url": "https://www.youtube.com/watch?v=example",
            "views": 0,
            "artist_id": artist_ids.get("Marcos Witt")
        },
        {
            "title": "Al que está sentado en el trono",
            "slug": "al-que-esta-sentado-en-el-trono",
            "lyrics": (
                "Al que está sentado en el trono\n"
                "Y al Cordero\n"
                "Sea la alabanza, la honra\n"
                "La gloria y el poder\n"
                "Por los siglos de los siglos\n\n"
                "Santo, santo es el Señor\n"
                "Dios todopoderoso\n"
                "Que era, que es y que ha de venir\n"
                "Santo, santo es el Señor."
            ),
            "sections": [
                {
                    "type": "coro",
                    "text": "Al que está sentado en el trono\nY al Cordero\nSea la alabanza, la honra\nLa gloria y el poder\nPor los siglos de los siglos"
                },
                {
                    "type": "verso",
                    "text": "Santo, santo es el Señor\nDios todopoderoso\nQue era, que es y que ha de venir\nSanto, santo es el Señor."
                }
            ],
            "key_signature": "G",
            "tempo": "80 BPM",
            "genre": "Adoración",
            "language": "es",
            "youtube_url": "https://www.youtube.com/watch?v=example2",
            "views": 0,
            "artist_id": artist_ids.get("Marcos Witt")
        },
        {
            "title": "Eres Rey",
            "slug": "eres-rey",
            "lyrics": (
                "Eres Rey, eres Rey\n"
                "Te coronamos Rey\n"
                "Eres Rey, eres Rey\n"
                "Señor de señores Rey\n\n"
                "Levantamos nuestras manos\n"
                "Y te adoramos Rey\n"
                "Levantamos nuestra voz\n"
                "Y gritamos eres Rey."
            ),
            "sections": [
                {
                    "type": "coro",
                    "text": "Eres Rey, eres Rey\nTe coronamos Rey\nEres Rey, eres Rey\nSeñor de señores Rey"
                },
                {
                    "type": "verso",
                    "text": "Levantamos nuestras manos\nY te adoramos Rey\nLevantamos nuestra voz\nY gritamos eres Rey."
                }
            ],
            "key_signature": "E",
            "tempo": "85 BPM",
            "genre": "Alabanza",
            "language": "es",
            "youtube_url": "https://www.youtube.com/watch?v=example3",
            "views": 0,
            "artist_id": artist_ids.get("Rojo")
        },
        {
            "title": "Funky",
            "slug": "funky",
            "lyrics": (
                "Yo tengo un amigo que me ama\n"
                "Me ama, me ama\n"
                "Su nombre es Jesús\n"
                "Él es mi pana, es mi pana\n\n"
                "Funky, funky, Jesús es mi funky\n"
                "Funky, funky, Jesús es mi funky\n"
                "Con Él puedo reír\n"
                "Con Él puedo gozar\n"
                "Jesús es mi funky."
            ),
            "sections": [
                {
                    "type": "verso",
                    "text": "Yo tengo un amigo que me ama\nMe ama, me ama\nSu nombre es Jesús\nÉl es mi pana, es mi pana"
                },
                {
                    "type": "coro",
                    "text": "Funky, funky, Jesús es mi funky\nFunky, funky, Jesús es mi funky\nCon Él puedo reír\nCon Él puedo gozar\nJesús es mi funky."
                }
            ],
            "key_signature": "C",
            "tempo": "120 BPM",
            "genre": "Hip-Hop",
            "language": "es",
            "youtube_url": "https://www.youtube.com/watch?v=example4",
            "views": 0,
            "artist_id": artist_ids.get("Redimi2")
        },
        {
            "title": "Tu Amor",
            "slug": "tu-amor",
            "lyrics": (
                "Tu amor es más grande que el cielo\n"
                "Más profundo que el mar\n"
                "Tu amor es perfecto y eterno\n"
                "Nunca me dejará\n\n"
                "Cantaré de tu amor para siempre\n"
                "Gritaré de tu bondad\n"
                "Tu amor es mi fuerza y mi torre\n"
                "Mi refugio y mi paz."
            ),
            "sections": [
                {
                    "type": "verso",
                    "text": "Tu amor es más grande que el cielo\nMás profundo que el mar\nTu amor es perfecto y eterno\nNunca me dejará"
                },
                {
                    "type": "coro",
                    "text": "Cantaré de tu amor para siempre\nGritaré de tu bondad\nTu amor es mi fuerza y mi torre\nMi refugio y mi paz."
                }
            ],
            "key_signature": "A",
            "tempo": "78 BPM",
            "genre": "Pop",
            "language": "es",
            "youtube_url": "https://www.youtube.com/watch?v=example5",
            "views": 0,
            "artist_id": artist_ids.get("Evan Craft")
        }
    ]
    
    for song_data in songs_data:
        try:
            existing_song = db.query(Song).filter_by(slug=song_data["slug"]).first()
            if not existing_song and song_data["artist_id"]:
                song = Song(**song_data)
                db.add(song)
                logger.info(f"✅ Canción '{song_data['title']}' creada")
            elif existing_song:
                logger.info(f"ℹ️ Canción '{song_data['title']}' ya existe")
            else:
                logger.warning(f"⚠️ No se pudo crear '{song_data['title']}' - artista no encontrado")
                
        except IntegrityError as e:
            db.rollback()
            logger.warning(f"⚠️ Error de integridad para canción '{song_data['title']}': {e}")
        except Exception as e:
            db.rollback()
            logger.error(f"❌ Error creando canción '{song_data['title']}': {e}")
    
    db.commit()


def create_sample_users(db: Session) -> List[int]:
    """Crear usuarios de ejemplo para testing"""
    users_data: List[Dict[str, Any]] = [
        {
            "email": "pastor@ecoiglesia.es",
            "username": "pastor_miguel",
            "full_name": "Pastor Miguel Rodríguez",
            "hashed_password": get_password_hash("Pastor123!"),
            "is_active": True,
            "is_admin": False,
            "is_verified": True,
            "is_premium": False,
            "role": "pastor",
            "status": "active",
            "musical_tastes": "Adoración, Tradicional, Coral",
            "favorite_artists": "Marcos Witt, Danilo Montero, Marco Barrientos"
        },
        {
            "email": "lider@ecoiglesia.es", 
            "username": "lider_ana",
            "full_name": "Ana María González",
            "hashed_password": get_password_hash("Lider123!"),
            "is_active": True,
            "is_admin": False,
            "is_verified": True,
            "is_premium": True,
            "role": "leader",
            "status": "active",
            "musical_tastes": "Contemporáneo, Pop, Alabanza",
            "favorite_artists": "Hillsong United, Jesus Culture, Bethel Music"
        },
        {
            "email": "musico@ecoiglesia.es",
            "username": "musico_carlos",
            "full_name": "Carlos Hernández",
            "hashed_password": get_password_hash("Musico123!"),
            "is_active": True,
            "is_admin": False,
            "is_verified": True,
            "is_premium": False,
            "role": "musician",
            "status": "active",
            "musical_tastes": "Rock, Hip-Hop, Experimental",
            "favorite_artists": "Rojo, Redimi2, Skillet"
        }
    ]
    
    user_ids: List[int] = []
    
    for user_data in users_data:
        try:
            existing = db.query(User).filter_by(email=user_data["email"]).first()
            if existing:
                user_ids.append(cast(int, existing.id))
                logger.info(f"ℹ️ Usuario '{user_data['username']}' ya existe")
            else:
                user = User(**user_data)
                db.add(user)
                db.flush()
                user_ids.append(cast(int, user.id))
                logger.info(f"✅ Usuario '{user_data['username']}' creado")
                
        except IntegrityError as e:
            db.rollback()
            logger.warning(f"⚠️ Error de integridad para usuario '{user_data['username']}': {e}")
        except Exception as e:
            logger.error(f"❌ Error creando usuario '{user_data['username']}': {e}")
    
    db.commit()
    return user_ids


def create_sample_favorites(db: Session, user_ids: List[int]) -> None:
    """Crear favoritos de ejemplo"""
    try:
        # Obtener algunas canciones para agregar como favoritas
        songs = db.query(Song).limit(5).all()
        
        if not songs or not user_ids:
            logger.info("ℹ️ No hay canciones o usuarios para crear favoritos")
            return
            
        favorites_created = 0
        for user_id in user_ids[:2]:  # Solo los primeros 2 usuarios
            for song in songs[:3]:  # Solo las primeras 3 canciones
                try:
                    existing = db.query(FavoriteSong).filter_by(
                        user_id=user_id, 
                        song_id=song.id
                    ).first()
                    
                    if not existing:
                        favorite = FavoriteSong(user_id=user_id, song_id=song.id)
                        db.add(favorite)
                        favorites_created += 1
                        
                except Exception as e:
                    logger.warning(f"⚠️ Error creando favorito: {e}")
                    continue
        
        db.commit()
        logger.info(f"✅ {favorites_created} favoritos creados")
        
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error creando favoritos: {e}")


def create_sample_activities(db: Session, user_ids: List[int]) -> None:
    """Crear actividades de ejemplo"""
    try:
        activities_data: List[Dict[str, Any]] = [
            {
                "user_id": user_ids[0] if user_ids else 1,
                "action": "view_song",
                "description": "Vio la canción 'Oceans (Where Feet May Fail)'"
            },
            {
                "user_id": user_ids[1] if len(user_ids) > 1 else 1,
                "action": "favorite_song",
                "description": "Agregó 'How He Loves' a favoritos"
            },
            {
                "user_id": user_ids[0] if user_ids else 1,
                "action": "search",
                "description": "Buscó canciones de adoración - 15 resultados encontrados"
            }
        ]
        
        activities_created = 0
        for activity_data in activities_data:
            try:
                activity = Activity(**activity_data)
                db.add(activity)
                activities_created += 1
            except Exception as e:
                logger.warning(f"⚠️ Error creando actividad: {e}")
                continue
        
        db.commit()
        logger.info(f"✅ {activities_created} actividades creadas")
        
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error creando actividades: {e}")


def create_sample_data():
    """Función principal para crear todos los datos de ejemplo"""
    logger.info("🚀 Iniciando creación de datos de ejemplo...")
    
    # Crear tablas si no existen
    create_tables()
    
    db = SessionLocal()
    try:
        # Crear usuario administrador
        admin_user = create_admin_user(db)
        logger.info(f"👤 Usuario admin creado/verificado: {admin_user.email}")
        
        # Crear artistas
        logger.info("📀 Creando artistas de ejemplo...")
        artist_ids = create_sample_artists(db)
        
        # Crear canciones
        logger.info("🎵 Creando canciones de ejemplo...")
        create_sample_songs(db, artist_ids)
        
        # Crear usuarios de ejemplo
        logger.info("👥 Creando usuarios de ejemplo...")
        user_ids = create_sample_users(db)
        
        # Crear favoritos de ejemplo
        logger.info("⭐ Creando favoritos de ejemplo...")
        create_sample_favorites(db, user_ids)
        
        # Crear actividades de ejemplo
        logger.info("📊 Creando actividades de ejemplo...")
        create_sample_activities(db, user_ids)
        
        # Estadísticas finales
        total_users = db.query(User).count()
        total_artists = db.query(Artist).count()
        total_songs = db.query(Song).count()
        total_favorites = db.query(FavoriteSong).count()
        total_activities = db.query(Activity).count()
        
        logger.info("🎉 ¡Datos de ejemplo creados exitosamente!")
        logger.info(f"📊 Estadísticas:")
        logger.info(f"   👤 Usuarios: {total_users}")
        logger.info(f"   🎨 Artistas: {total_artists}")
        logger.info(f"   🎵 Canciones: {total_songs}")
        logger.info(f"   ❤️ Favoritos: {total_favorites}")
        logger.info(f"   📈 Actividades: {total_activities}")
        logger.info(f"")
        logger.info(f"🔑 Credenciales de acceso:")
        logger.info(f"   Admin: admin@ecoiglesialetras.es / EcoAdmin2025!")
        logger.info(f"   Pastor: pastor@ecoiglesia.es / Pastor123!")
        logger.info(f"   Líder: lider@ecoiglesia.es / Lider123!")
        logger.info(f"   Músico: musico@ecoiglesia.es / Musico123!")
        
    except Exception as e:
        logger.error(f"❌ Error al crear datos de ejemplo: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def reset_database():
    """Función para resetear completamente la base de datos"""
    logger.warning("⚠️ ADVERTENCIA: Esta función eliminará TODOS los datos!")
    response = input("¿Estás seguro de que quieres continuar? (sí/no): ")
    
    if response.lower() in ['sí', 'si', 'yes', 'y']:
        db = SessionLocal()
        try:
            logger.info("🗑️ Eliminando todos los datos...")
            
            # Eliminar en orden para respetar las foreign keys
            db.query(Activity).delete()
            db.query(FavoriteSong).delete()
            db.query(Song).delete()
            db.query(Artist).delete()
            db.query(User).delete()
            
            db.commit()
            logger.info("✅ Base de datos limpiada exitosamente")
            
            # Recrear datos
            create_sample_data()
            
        except Exception as e:
            logger.error(f"❌ Error reseteando la base de datos: {e}")
            db.rollback()
            raise
        finally:
            db.close()
    else:
        logger.info("❌ Operación cancelada")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--reset":
        reset_database()
    else:
        create_sample_data()


import json

