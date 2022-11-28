const Post = require('../models/Post')
const User = require('../models/User')
const { post } = require('../routes/postRoutes')

const Comentario = require('../models/Comentario')



const {Op} = require('sequelize')

module.exports = class PostController{
    static async showPost(req,res){

        //pesquisa do form. puxa na url
        let search= ''
        if(req.query.search){
            search = req.query.search
        }

        //ordenar por:
        let order = 'DESC'
        if(req.query.order === 'old'){
            order='ASC'
        }else{
            order='DESC'
        }

        const postsData = await Post.findAll({
            include: User,
            where: {
                conteudo: { [Op.like]: `%${search}%` },
              },
            order:[['createdAt', order]],
        })
        

        //const id = req.body.id
        //console.log("ID DO POST"+id)
        const comentariosData = await Comentario.findAll({
            include: Post,
            where: {
                conteudo: { [Op.like]: `%${search}%` },
              },
        })

        const userId = req.session.userid
        let user = await User.findOne({where: {id:userId}})
        user = user.dataValues
        console.log(" PERFIL DO USUARIo: "+user.perfil);
        let publico = false
        let admin = true
        if(user.perfil == 'admin'){
            admin = true
        }else{
            admin = false
            publico= true
        }

        

        let consult= postsData.map((result) => result.get({plain:true}))
        //console.log(posts)
        let posts=new Array();
        consult.forEach((item)=>{
            let id = req.body.postid;
            console.log(comentariosData)
            item.comentarios=new Array()
            comentariosData.map((result) => result.get(Post.findAll())).forEach((coment)=>{
                if(item.id == coment.postId){
                    item.comentarios.push(coment)
                }

            });

        
            posts.push(item)
            
        });
     

        //quantidade de posts encontrados na pesquisa
        let postsQtd = posts.length

        if(postsQtd ===0){
            postsQtd=false
        }

    


        res.render('post/showPost', {posts, search, postsQtd, admin})
    }

    
    static async forum(req,res){
        const userId = req.session.userid
        console.log("USER ID FORUM "+userId)
        let user = await User.findOne({
            where:{
                id:userId,
            },
            include: Post,
            plain: true,
        })

        user = user.dataValues
        console.log(" PERFIL DO USUARIo: "+user.perfil);

        let publico = false
        let admin = true
        if(user.perfil == 'admin'){
            admin = true
        }else{
            admin = false
            publico= true
        }

        
        //ver se o usuario existe
        if(!user){
            res.redirect('/login')
        }

        const posts= user.posts.map((result) => result.dataValues)
        
        res.render('post/forum',{ posts, admin, publico })

    }

    

    static async createPost(req, res){
        res.render('post/create')
    }

    static async createPostSave(req,res){
        const userId = req.session.userid
        const posts = {
            conteudo: req.body.conteudo,
            userId: userId
        }

        
        try{
            await Post.create(posts)

            req.flash('message','Post realizado com sucesso!')

            req.session.save(()=>{
                res.redirect('/post/forum')
            })
        }catch(error){
            console.log(error)
        }
    }

    static async removePost(req,res){
        const id = req.body.id

        const userId = req.session.userid

        try{
            await Post.destroy({where:{id: id, userId: userId}})
            req.flash('message','Post removido com sucesso!')

            req.session.save(()=>{
                res.redirect('/post/forum')
            })
        }catch(error){
            console.log(error)
        }
    }

    static async adminRemovePost(req,res){
        const id = req.body.id
        const userId = req.session.userid
        
        //usuario existe
        let user = await User.findOne({where: {id:userId}})
        user = user.dataValues
        let publico = false
        let admin = true
        if(user.perfil == 'admin'){
            admin = true
        }else{
            admin = false
            publico= true
        }

        try{
            await Post.destroy({where:{id: id}})
            req.flash('message','Post removido com sucesso!')

            req.session.save(()=>{
                res.redirect('/post/forum')
            })
        }catch(error){
            console.log(error)
        }
    }

    static async editPost(req,res){
        const id = req.params.id
        

        const post = await Post.findOne({where:{id:id}, raw:true})
        
        res.render('post/edit', {post})
        

    }

    static async editPostSave(req,res){
        const id = req.body.id
       

        const post = {
            conteudo: req.body.conteudo
        }
        
        try{
            await Post.update(post, {where: {id:id}})
            req.flash('message','Post Atualizado com sucesso!')

            req.session.save(()=>{
                res.redirect('/post/forum')
            })
        }catch(error){
            console.log(error)
        }
    }

    static async createComentario(req, res){
        //ESSE PEGA
        const id = req.params.id
        console.log(id+"REQ PARAMS")

        const post = await Post.findOne({where:{id:id}, raw:true})

        res.render('post/createComentario',{post})
    }

    

    static async createComentarioSave(req,res){
        //console.log("ID? "+req.body.id)
        //const{conteudo,postId} = req.body
        
        const id = req.body.id
        console.log("req.body.id"+id)
    
        const comentario = {
            conteudo: req.body.conteudo,
            postId: id
        }

        


        try{
            await Comentario.create(comentario)

            req.flash('message','Comentário realizado com sucesso!')

            req.session.save(()=>{
                res.redirect('../post/showPost')
            })
        }catch(error){
            console.log(error)
        }
    }

}
